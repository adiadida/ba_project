import {Button, Card, CardActions, CardContent, Typography} from "@mui/material";
import {JSX} from "react";

export const GenericInputCard = ({
                                     cardTitle,
                                     inputChild,
                                     buttonTitle,
                                     inputs,
                                     onChange,
                                     onClick
                                 }: GenericInputCardProps) => {

    // Check if any of the input values are NaN
    const isAnyInputNaN = Object.values(inputs).some(
        (value) =>  isNaN(value)
    );

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    {cardTitle}
                </Typography>
                {inputChild}
            </CardContent>
            <CardActions>
                <Button
                    variant="outlined"
                    onClick={onClick}
                    disabled={isAnyInputNaN}
                >{buttonTitle}</Button>
            </CardActions>
        </Card>
    )

}

export type GenericInputCardProps = {
    cardTitle: string;
    inputChild: JSX.Element;
    buttonTitle: string;
} & DataInputProps & ButtonProps;

export interface DataInputProps {
    inputs: InputProps;
    onChange: (inputs: InputProps) => void;
    //onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export type InputProps = {
    criteria?: number | undefined
    alternatives?: number | undefined
    decisionMakers?: number | undefined
}

export type ButtonProps = {
    onClick: () => void;
}
