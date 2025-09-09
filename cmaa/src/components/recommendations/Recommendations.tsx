import Grid from "@mui/material/Grid";
import {Typography} from "@mui/material";
import {AggregatedInputs, AggregatedInputsProps} from "@/components/cmaa/AggregatedInputs";
import {GenericAccordion} from "@/components/generics/GenericAccordion";

export const Recommendations = ({aggJudgements, aggPrefs}:AggregatedInputsProps) => {
  return(
      <Grid container spacing={2}>
          <Grid container size={12}>
              <Typography>Schritt 1: Konflikt auswählen und diskutieren</Typography>
          </Grid>
          {/*<Grid container spacing={2}>
              <Grid>
                  <GenericAccordion title={'konsensbasierte Konflikt-Empfehlung'} child={<AggregatedInputs/>}/>
              </Grid>
              <Grid>
                  <GenericAccordion title={'Entwicklungspotential der Alternativen klären'} child={<AggregatedInputs/>}/>
              </Grid>

          </Grid>*/}
      </Grid>
  )
}
