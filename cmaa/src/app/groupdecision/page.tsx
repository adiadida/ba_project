'use client'
import {GenericHeader} from "@/components/generics/GenericHeader";
import Grid from "@mui/material/Grid";
import {SAWInputCard} from "@/components/saw/SAWInputCard";
import {useState} from "react";
import {InputProps} from "@/components/generics/GenericInputCard";
import {DecisionRequirements} from "@/components/texts/DecisionRequirements";

export default function DecisionPage() {

    const [inputs, setInputs] = useState<InputProps>({
        criteria: undefined,
        alternatives: undefined,
        decisionMakers: undefined,
    });

    const handleInputChange = (updatedInputs: Partial<InputProps>) => {
        setInputs((prev: InputProps) => ({ ...prev, ...updatedInputs }));
    };

    return (
        <Grid container spacing={2}>
            <GenericHeader title={'Gruppenentscheidung'}/>
            <Grid container padding={2} spacing={4} size={12} columns={{xs: 6, md: 12, lg:12}}
                  sx={{
                      alignItems: "flex-start",
                      justifyContent: "center",
                  }}
            >
                <Grid size={6}>
                    <DecisionRequirements/>
                </Grid>
                <Grid size={6}>
                    <SAWInputCard inputs={inputs} onDataAction={handleInputChange}/>
                </Grid>

            </Grid>
        </Grid>

    )
}