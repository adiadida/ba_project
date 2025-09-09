import * as React from 'react';
import CircularProgress, {
    CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {GenericCard} from "@/components/generics/GenericCard";

function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number },
) {
    return (
        <Box sx={{position: 'relative', display: 'inline-flex'}}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{color: 'text.secondary'}}
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

export const Consensus = ({rankAcceptabilityIndices}: ConsensusProps) => {

    // error handling
    if (!rankAcceptabilityIndices || rankAcceptabilityIndices.length === 0) {
        return <div></div>; // Handle the case where there are no indices
    }

    const rankOneOfAlts = rankAcceptabilityIndices[0];

    // m.. number of alternatives
    const m = rankOneOfAlts.length;

    function logTwo(val: number) {
        return Math.log(val) / Math.LN2;
    }

    // h_curr = - sum (rankOneOfAltm * log_2(rankOneOfAltm ))

    const generateCurrentEntropy = () => {

        let sum = 0;

        for (let alt = 0; alt < m; alt++) {
            if (rankOneOfAlts[alt] > 0) { // Ensures that log of 0 or negative values isn't taken
                sum += rankOneOfAlts[alt] * logTwo(rankOneOfAlts[alt]);
            }
        }
        return -sum;
    }

    const currentEntropy = generateCurrentEntropy();
    //console.log(currentEntropy);

    // h_max = - log_2 (1/m).
    const maxEntropy = -logTwo(1 / m);
    //console.log(maxEntropy);

    // h_curr / h_max
    const entropyInPercent = (1-(currentEntropy / maxEntropy)) * 100;

    return (
        <GenericCard title={'erreichter Konsens'} child={<CircularProgressWithLabel value={entropyInPercent}/>}/>
    );
}
export type ConsensusProps = {
    rankAcceptabilityIndices: number[][];
}