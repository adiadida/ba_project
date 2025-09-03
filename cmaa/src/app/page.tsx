'use client'
import {GenericHeader} from "@/components/generics/GenericHeader";
import Grid from "@mui/material/Grid";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";

export default function Home() {

    // initialize router
    const router = useRouter();
    // navigate to next page
    const handleButtonClick = () => {
      router.push(`/groupdecision`);
    }
  return (
      <Grid container spacing={2}>
          <GenericHeader title={'Start'}/>
          <Grid container size={12} alignItems="center" justifyContent={"center"}>
              <Grid>
                  <Button size="large" variant="contained" color="primary" onClick={handleButtonClick}>mit der Gruppenenstscheidung starten</Button>
              </Grid>
          </Grid>
      </Grid>

      );
}
