import {Grid} from "@mui/material";
import {JudgementAcceptabilitiesAndEntropy} from "@/components/cmaa/JudgementAcceptabilitiesAndEntropy";
import {useEffect, useState} from "react";

export const JudgementStatistics = ({
                                        rankAcceptabilityCounter,
                                        judgCircumstanceCounter,
                                        judgMultiInputs
                                    }: JudgementStatisticsProps) => {

    const [kMonteCarlo, setKMonteCarlo] = useState<number>(0);

    useEffect(() => {
        let sum = 0;
        for (let alt = 0; alt < rankAcceptabilityCounter.length; alt++) {
            sum += rankAcceptabilityCounter[alt][0]; // rank 1 is in first col - rAC[alts][ranks]
        }

        setKMonteCarlo(sum);

    }, [rankAcceptabilityCounter]);

    return (
        <Grid container spacing={2} size={{md: 12, lg: 6}}>
            <Grid>
                <JudgementAcceptabilitiesAndEntropy kMonteCarlo={kMonteCarlo} judgCircumstanceCounter={judgCircumstanceCounter} judgMultiInputs={judgMultiInputs} />
            </Grid>
        </Grid>
    )
}
// need rank acceptability counter, judg inputs, judg circumstance counter
export type JudgementStatisticsProps = {
    rankAcceptabilityCounter: number[][];
    judgCircumstanceCounter: number[][][][]; // [altWinner][crit][alt][judgCounter]
    judgMultiInputs: number[][][]; // [crit][alt][judgIdx]
}