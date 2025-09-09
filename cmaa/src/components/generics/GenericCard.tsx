import {Box, Card, CardContent, Typography} from "@mui/material";
import {Divider} from "@mui/material";

export const GenericCard = ({title, child}: GenericCardProps) => {
  return (
      <Card sx={{height: 170}}>
            <CardContent>
                <Typography variant={"h6"} gutterBottom>{title}</Typography>
                <Divider variant="middle"/>
                <Box display="flex" justifyContent="center" alignItems={"center"} minHeight={70} maxHeight={100}>
                    {child}
                </Box>
            </CardContent>
        </Card>
  )
}
export type GenericCardProps = {
    title: string;
    child?: React.ReactNode;
}