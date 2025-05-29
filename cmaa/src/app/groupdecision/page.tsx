'use client'
import {GenericHeader} from "@/components/GenericHeader";
import Grid from "@mui/material/Grid";
import {Card} from "@mui/material";
import {SWAInputCard} from "@/components/SWAInputCard";

export default function DecisionPage() {
    return (

        <Grid container spacing={2}>
            <GenericHeader title={'Gruppenentscheidung'}/>
            <Grid container spacing={4} size={{xs: 11, md: 7, lg: 8}}
                  sx={{
                      justifyContent: "center",
                      alignItems: "center",
                  }}
            >
                <Grid item xs={11}>
                    <SWAInputCard/>
                </Grid>

                <Grid item xs={12}>
                    <Card></Card>
                </Grid>
            </Grid>
        </Grid>

    )
}