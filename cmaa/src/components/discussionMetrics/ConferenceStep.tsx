import {Typography} from "@mui/material";
import {GenericCard} from "@/components/generics/GenericCard";

export const ConferenceStep = ({conferenceCounter}: ConferenceStepProps) => {

    return (
        <GenericCard title={'Anzahl der Konfliktklärungen'} child={<Typography variant={"h6"} gutterBottom>{conferenceCounter} </Typography>}/>
    )
}

export type ConferenceStepProps = {
    conferenceCounter: number;
}