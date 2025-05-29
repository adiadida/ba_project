import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Grid} from "@mui/material";
import React from "react";

/**
 * renders title, child and menu component in header
 * **/
export const GenericHeader = ({title}: GenericHeaderProps) => {
    return (
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Grid
                                container
                                rowSpacing={1}
                                alignItems="center"
                                justifyContent={"space-between"}
                                direction={"row"}
                        >
                            {title}

                        </Grid>
                    </Toolbar>
                </AppBar>
        </Grid>
    );
};

type GenericHeaderProps = {
    title: string;
};
