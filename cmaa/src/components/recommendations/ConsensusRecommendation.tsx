import {
    RecommendationsDataGrids,
    RecommendationsDataGridsProps
} from "@/components/recommendations/RecommendationsDataGrids";
import Grid from "@mui/material/Grid";
import {Typography} from "@mui/material";
import * as React from "react";

export const ConsensusRecommendation = ({
                                            aggPrefs,
                                            aggJudgements,
                                            prefRecIdx,
                                            judgRecIdx
                                        }: RecommendationsDataGridsProps) => {
    return (<Grid container spacing={2} alignItems="center">

        <Grid size={"auto"}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Die Auflösung dieser Konflikte führt in der Regel zu mehr Einstimmigkeit.
            </Typography>
        </Grid>
        <Grid container size={12} spacing={2}>
            <RecommendationsDataGrids aggPrefs={aggPrefs}
                                      aggJudgements={aggJudgements}
                                      prefRecIdx={prefRecIdx}
                                      judgRecIdx={judgRecIdx}/>
        </Grid>
    </Grid>)
}

export type ConsensusRecommendationProps = {
    prefConsensusRec: number[];
    judgConsensusRec: number[][];

}

