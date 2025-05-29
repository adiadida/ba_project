'use client'

import {Grid} from "@mui/material";
import {GenericInput} from "@/components/GenericInput";

export const SWAInputs = () => {
    return (
        <Grid direction={'row'} spacing={2}>

            <GenericInput typoText={'Anzahl Entscheidungsträger'} fieldName={'decisionMakers'} fieldLabelText={'Zahl'} isRequired={true} isDisabled={false}/>
            <GenericInput typoText={'Anzahl Bewertungskriterien'} fieldName={'criteria'} fieldLabelText={'Zahl'} isRequired={true} isDisabled={false}/>
            <GenericInput typoText={'Erfüllungsgrad der Kriterien'} fieldName={''} fieldLabelText={'in Prozent, z.B. 0,8'} isRequired={false} isDisabled={true}/>
            <GenericInput typoText={'Priorisierung der Kriterien'} fieldName={''} fieldLabelText={'in Zahlen 1..4'} isRequired={false} isDisabled={true}/>
            <GenericInput typoText={'Anzahl der zu bewertenden Alternativen'} fieldName={''} fieldLabelText={'Zahl'} isRequired={true} isDisabled={false}/>

        </Grid>
    )

}