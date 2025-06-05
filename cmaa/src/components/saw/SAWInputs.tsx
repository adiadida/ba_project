'use client'

import {Grid} from "@mui/material";
import {GenericInput} from "@/components/generics/GenericInput";
import {SWAInputCardProps} from "@/components/saw/SAWInputCard";

export const SAWInputs = ({inputs, onData}: SWAInputCardProps) => {

    const handleInputChange = (name: string, value: string) => {
        // Convert value to number if needed
        const numValue = Number(value);
        const updatedValue = isNaN(numValue) ? value : numValue;
        onData({ ...inputs, [name]: updatedValue });
    };

    return (
        <Grid direction={'row'} spacing={2}>

            <GenericInput typoText={'Anzahl Entscheidungsträger'} fieldName={'decisionMakers'} fieldLabelText={'Zahl'}
                          isRequired={true} isDisabled={false}
                          inputs={inputs}
                          onChange={(updated) => handleInputChange('decisionMakers', String(updated.decisionMakers))}
            />
            <GenericInput typoText={'Anzahl Bewertungskriterien'} fieldName={'criteria'} fieldLabelText={'Zahl'}
                          isRequired={true} isDisabled={false}
                          inputs={inputs}
                          onChange={(updated) => handleInputChange('criteria', String(updated.criteria))}
            />
            <GenericInput typoText={'Erfüllungsgrad der Kriterien'} fieldName={''}
                          fieldLabelText={'in Zahlen 1..5'} isRequired={false} isDisabled={true}
            />
            <GenericInput typoText={'Priorisierung der Kriterien'} fieldName={''} fieldLabelText={'in Zahlen 1..5'}
                          isRequired={false} isDisabled={true}
            />
            <GenericInput typoText={'Anzahl der zu bewertenden Alternativen'} fieldName={'alternatives'} fieldLabelText={'Zahl'}
                          isRequired={true} isDisabled={false}
                          inputs={inputs}
                          onChange={(updated) => handleInputChange('alternatives', String(updated.alternatives))}
            />

        </Grid>
    )

}