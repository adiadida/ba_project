import Grid from "@mui/material/Grid";
import {AggregatedInputsProps} from "@/components/cmaa/AggregatedInputs";
import {GenericAccordion} from "@/components/generics/GenericAccordion";
import {
    ConsensusRecommendation,
    ConsensusRecommendationProps
} from "@/components/recommendations/ConsensusRecommendation";
import {
    DevelopmentRecommendation,
    DevelopmentRecommendationProps
} from "@/components/recommendations/DevelopmentRecommendation";

export const Recommendations = ({
                                    aggJudgements,
                                    aggPrefs,
                                    prefConsensusRec,
                                    judgConsensusRec,
                                    prefDevelopmentRec,
                                    judgDevelopmentRec
                                }: RecommendationsProps) => {
    return (
        <Grid container spacing={2}>

            <Grid container spacing={2}>
                <Grid>
                    <GenericAccordion title={'konsensbasierte Konflikt-Empfehlung'}
                                      child={<ConsensusRecommendation aggPrefs={aggPrefs} aggJudgements={aggJudgements}
                                                                      prefRecIdx={prefConsensusRec}
                                                                      judgRecIdx={judgConsensusRec}/>}/>
                </Grid>
                <Grid>
                    <GenericAccordion title={'Entwicklungspotential der Alternativen klären'}
                                      child={<DevelopmentRecommendation aggPrefs={aggPrefs}
                                                                        aggJudgements={aggJudgements}
                                                                        prefDevelopmentRec={prefDevelopmentRec}
                                                                        judgDevelopmentRec={judgDevelopmentRec}/>}/>
                </Grid>

            </Grid>
        </Grid>
    )
}

type RecommendationsProps = AggregatedInputsProps & ConsensusRecommendationProps & DevelopmentRecommendationProps;
