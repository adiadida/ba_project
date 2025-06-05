import {Card, CardContent, Divider, Typography} from "@mui/material";

export const GenericLikertCard = ({title, one, two, three, four, five}: GenericLikertCardProps) => {
    return (
        <Card sx={{maxHeight:'80%'}} variant="outlined">
            <CardContent>
                <Typography variant="subtitle1" component="div">
                    {title}
                </Typography>
                <Divider variant="middle"/>
                <Typography variant={'body2'}>
                    1: {one}
                </Typography>
                <Typography variant={'body2'}>
                    2: {two}
                </Typography>
                <Typography variant={'body2'}>
                    3: {three}
                </Typography>
                <Typography variant={'body2'}>
                    4: {four}
                </Typography>
                <Typography variant={'body2'}>
                    5: {five}
                </Typography>
            </CardContent>
        </Card>
    )

}

export type GenericLikertCardProps = {
    title: string;
    one: string;
    two: string;
    three: string;
    four: string;
    five: string;
}