'use client'

import {Grid, TextField, Typography} from "@mui/material";
import {ChangeEvent} from "react";
import {InputProps} from "@/components/GenericInputCard";

export const GenericInput = ({
                                 typoText,
                                 fieldName,
                                 fieldLabelText,
                                 isRequired,
                                 isDisabled,
                                 inputs,
                                 onChange
                             }: GenericInputProps) => {

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
            // Call parent's onChange with updated inputs
        if (onChange) {
            onChange({ [name]: value });
        }
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
            <Grid>
                <Typography variant="caption" component="div">{typoText}</Typography>
            </Grid>
            <Grid>
                <TextField
                    required={isRequired}
                    disabled={isDisabled}
                    name={fieldName}
                    label={fieldLabelText}
                    variant="outlined"
                    margin="normal"
                    value={inputs ? String(inputs[fieldName as keyof typeof inputs] ?? '') : ''}
                    onChange={handleChange}
                />
            </Grid>

        </Grid>
    )
}

export type GenericInputProps = {
    typoText: string;
    fieldName: string;
    fieldLabelText: string;
    isRequired: boolean;
    isDisabled: boolean;
    inputs?: InputProps;
    onChange?: (inputs: { [p: string]: string }) => void;
}

