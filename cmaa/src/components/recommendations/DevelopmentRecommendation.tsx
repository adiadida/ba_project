import Grid from "@mui/material/Grid";
import * as React from 'react';
import {FormControl, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import {RecommendationsDataGrids} from "@/components/recommendations/RecommendationsDataGrids";
import {AggregatedInputsProps} from "@/components/cmaa/AggregatedInputs";

export const DevelopmentRecommendation = ({
                                              aggPrefs,
                                              aggJudgements,
                                              prefDevelopmentRec,
                                              judgDevelopmentRec
                                          }: AggregatedInputsProps & DevelopmentRecommendationProps) => {
    const altsArray = getAltsArray(prefDevelopmentRec);
    const [alternative, setAlternative] = React.useState<string>('Alternative wählen');

    const handleChange = (event: SelectChangeEvent) => {
        const alternativeString = event.target.value as string;
        setAlternative(alternativeString); // Store the selected alternative as a string
    };

    // Get the index of the selected alternative
    const alternativeIndex = parseInt(alternative.split(' ')[1]) - 1;


    return (
        <Grid container spacing={2} alignItems="center">
            <Grid size={{xs:12, md:6, lg:2}}>
                <FormControl sx={{m: 1, minWidth: 120}} size="small">
                    <Select

                        value={alternative}
                        label="Alternative auswählen"
                        onChange={handleChange}
                    >
                        {altsArray.map((alt, index) => (
                            <MenuItem key={index} value={alt}>{alt}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={"auto"}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Abhängig von der Auflösung dieses Konflikts wird die Alternative gestärkt oder geschwächt.
                </Typography>
            </Grid>
            <Grid container size={12} spacing={2}>
                {/* Render RecommendationsDataGrids when an alternative is selected */}
                {alternativeIndex >= 0 && (
                    <RecommendationsDataGrids
                        aggPrefs={aggPrefs}
                        aggJudgements={aggJudgements}
                        prefRecIdx={prefDevelopmentRec[alternativeIndex]}
                        judgRecIdx={judgDevelopmentRec[alternativeIndex]}
                    />
                )}
            </Grid>
        </Grid>
    )
}

export type DevelopmentRecommendationProps = {
    prefDevelopmentRec: number[][];
    judgDevelopmentRec: number[][][];
}

function getAltsArray(prefDevelopmentRec: number[][]): string[] {
    const numAlts: number = prefDevelopmentRec.length;
    let altsArray: string[] = [];

    altsArray.push('Alternative wählen');

    for (let i = 0; i < numAlts; i++) {
        altsArray.push('Alternative ' + (i + 1));
    }

    return altsArray;
}