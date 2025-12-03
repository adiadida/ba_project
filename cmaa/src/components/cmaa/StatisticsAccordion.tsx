import {Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {GenericAccordion} from "@/components/generics/GenericAccordion";
import {RankAcceptabilityIndices} from "@/components/cmaa/RankAcceptabilityIndices";
import {PreferenceStatistics} from "@/components/cmaa/PreferenceStatistics";
import {JudgementStatistics} from "@/components/cmaa/JudgementStatistics";

export const StatisticsAccordion = ({
                                        rankAcceptabilityIndices,
                                        rankAcceptabilityCounter,
                                        preferencesCircumstanceCounterRef,
                                        preferencesMultiInputs,
                                        judgementsCircumstanceCounterRef,
                                        judgementsMultiInputs
                                    }: StatisticsAccordionProps) => {
    return (
        <Grid container size={12}>

            <Box sx={{width: '95vw', margin: 'auto'}}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>zusätzliche Statistiken für den Moderator</Typography>
                    </AccordionSummary>
                    <AccordionDetails>


                        {/* Accordion for Rank Acceptability Indices */}
                        {rankAcceptabilityIndices && rankAcceptabilityIndices.length > 0 && (

                            <GenericAccordion title={'Stärke der Alternative pro Rang'} child={
                                <Grid container size={6}>
                                    <RankAcceptabilityIndices
                                        rankAccIdx={rankAcceptabilityIndices}
                                        rankAccCounter={rankAcceptabilityCounter}
                                    />
                                </Grid>}
                            />
                        )}


                        {/* Accordion for Preference Statistics */}
                        {rankAcceptabilityCounter && rankAcceptabilityCounter.length > 0 &&
                            preferencesCircumstanceCounterRef &&
                            preferencesCircumstanceCounterRef.length > 0 &&
                            preferencesMultiInputs.length > 0 && (
                                <GenericAccordion title={'Priorisierungen'} child={
                                    <Grid container size={12}>
                                        <PreferenceStatistics
                                            rankAcceptabilityCounter={rankAcceptabilityCounter}
                                            prefCircumstanceCounter={preferencesCircumstanceCounterRef}
                                            prefsMultiInputs={preferencesMultiInputs}
                                        />
                                    </Grid>
                                }/>
                            )}

                        {/* Accordion for Judgement Statistics */}

                        {rankAcceptabilityCounter && rankAcceptabilityCounter.length > 0 &&
                            judgementsCircumstanceCounterRef &&
                            judgementsCircumstanceCounterRef.length > 0 &&
                            judgementsMultiInputs.length > 0 && (
                                <GenericAccordion title={'Beurteilungen zum Erfüllungsgrad'} child={
                                    <Grid container size={12}>
                                        <JudgementStatistics
                                            rankAcceptabilityCounter={rankAcceptabilityCounter}
                                            judgCircumstanceCounter={judgementsCircumstanceCounterRef}
                                            judgMultiInputs={judgementsMultiInputs}
                                        />
                                    </Grid>
                                }/>
                            )}


                    </AccordionDetails>
                </Accordion>
            </Box>
        </Grid>
    )
}

type StatisticsAccordionProps = {
    rankAcceptabilityIndices: number[][];
    rankAcceptabilityCounter: number[][];
    preferencesCircumstanceCounterRef: number[][][];
    preferencesMultiInputs: number[][];
    judgementsCircumstanceCounterRef: number[][][][];
    judgementsMultiInputs: number[][][];
}
