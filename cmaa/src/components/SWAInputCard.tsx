import {Button, Card, CardActions, CardContent, Typography} from "@mui/material";
import {SWAInputs} from "@/components/SWAInputs";

export const SWAInputCard = () => {

    const handleNext = () => {
    // Initialize table with default size, e.g., 3x3

  };

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" component="div">
                    Nutzwertanalyse (SWA)
                </Typography>
                <SWAInputs/>
            </CardContent>
            <CardActions>
                <Button variant="outlined">generieren</Button>
            </CardActions>
        </Card>
    )

}