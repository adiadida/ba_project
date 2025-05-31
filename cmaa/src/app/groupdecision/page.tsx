'use client'
import {GenericHeader} from "@/components/GenericHeader";
import Grid from "@mui/material/Grid";
import {SWAInputCard} from "@/components/SWAInputCard";
import {useState} from "react";
import {InputProps} from "@/components/GenericInputCard";
import {Box} from "@mui/system";

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
            <Grid container spacing={4} size={{xs: 11, md: 7, lg: 8}}
                  sx={{
                      justifyContent: "center",
                      alignItems: "center",
                  }}
            >
                <Grid size={{xs: 11, md: 7, lg: 8}}>
                    <SWAInputCard inputs={inputs} onData={handleInputChange}/>
                </Grid>

                <Grid size={{xs: 11, md: 7, lg: 8}}>
                    <Box display="flex" justifyContent="flex-end"></Box>
                </Grid>
            </Grid>
        </Grid>

    )
}