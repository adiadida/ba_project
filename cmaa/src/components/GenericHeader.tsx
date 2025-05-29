import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Grid} from "@mui/material";
import React from "react";

/**
 * renders title, child and menu component in header
 * **/
export const GenericHeader = ({title}: GenericHeaderProps) => {
    return (
            <Box sx={{flexGrow: 0}}>
                <AppBar position="static">
                    <Toolbar>
                        <Grid
                                container
                                rowSpacing={1}
                                alignItems="center"
                                justifyContent={"space-between"}
                                direction={"row"}
                        >
                            title={title}

                        </Grid>
                    </Toolbar>
                </AppBar>
            </Box>
    );
};

type GenericHeaderProps = {
    title: string;
};
