'use client'
import {GenericHeader} from "@/components/generics/GenericHeader";
import Grid from "@mui/material/Grid";
import {SAWInputCard} from "@/components/saw/SAWInputCard";
import {useState} from "react";
import {InputProps} from "@/components/generics/GenericInputCard";

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
            <Grid container spacing={4} size={{xs: 11, md: 7, lg: 6}}
                  sx={{
                      alignItems: "flex-start",
                      justifyContent: "center",
                  }}
            >
                <Grid size={11}>
                    <SAWInputCard inputs={inputs} onData={handleInputChange}/>
                </Grid>

            </Grid>
        </Grid>

    )
}