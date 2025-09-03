import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Grid, Typography} from "@mui/material";
import React from "react";
import {blue} from "@mui/material/colors";

/**
 * renders title, child and menu component in header
 * **/
export const GenericHeader = ({title}: GenericHeaderProps) => {
    return (
        <Grid size={12}>
                <AppBar position="static">
                    <Toolbar color={blue[700]} >
                        <Grid
                                container
                                rowSpacing={1}
                                alignItems="center"
                                justifyContent={"space-between"}
                                direction={"row"}
                        >
                            <Typography variant={'h5'}>{title}</Typography>


                        </Grid>
                    </Toolbar>
                </AppBar>
        </Grid>
    );
};

type GenericHeaderProps = {
    title: string;
};
