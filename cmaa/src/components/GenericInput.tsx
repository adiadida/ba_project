'use client'

import {Grid, TextField, Typography} from "@mui/material";
import {useState} from "react";

export const GenericInput = ({typoText, fieldName, fieldLabelText, isRequired,isDisabled}: GenericInputProps) => {

    const [inputs, setInputs] = useState({ criteria: '', alternatives: '', decisionMakers: '' });

    const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

    return (
        <Grid container
              direction={{xs: 'column', sm: 'row'}}
              spacing={1}
              sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                     }}
        >
            <Grid item>
                <Typography variant="caption" component="div">{typoText}</Typography>
            </Grid>
            <Grid item>
                <TextField
                    required={isRequired}
                    disabled={isDisabled}
                    name = {fieldName}
                    label={fieldLabelText}
                    variant="outlined"
                    margin="normal"
                    onChange={handleInputChange}
                />
            </Grid>

        </Grid>
    )
}

type GenericInputProps = {
    typoText: string;
    fieldName: string;
    fieldLabelText: string;
    isRequired: boolean;
    isDisabled: boolean;
}

