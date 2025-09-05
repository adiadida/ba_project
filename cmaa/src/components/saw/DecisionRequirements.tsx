import {Card, CardContent, Divider, List, ListItem, Typography} from "@mui/material";

export const DecisionRequirements = () => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" component="div">
                    Voraussetzungen
                </Typography>
                <Divider variant="middle"/>
                <List>
                    <ListItem>
                        1: Alle möglichen Optionen der Entscheidung sind als Alternativen definiert.
                    </ListItem>

                    <ListItem>
                        2: Die Alternativen werden anhand von festgelegten Kriterien bewertet.
                    </ListItem>

                    <ListItem>
                        3: Es steht fest, was das verfolgte Ziel mit der Entscheidung ist.
                    </ListItem>

                </List>
            </CardContent>
        </Card>
    );
}