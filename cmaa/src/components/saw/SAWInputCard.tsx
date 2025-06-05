import {GenericInputCard, InputProps} from "@/components/generics/GenericInputCard";
import {SAWInputs} from "@/components/saw/SAWInputs";
import {useRouter} from "next/navigation";

export const SAWInputCard = ({inputs, onData}: SWAInputCardProps) => {

    // Hooks need to be declared in the first line of a function or outside
    const router = useRouter();

    const handleDataChange = (newInputs: InputProps) => {
        onData(newInputs);
    };

    const handleNext = (inputs: InputProps) => {
        // send inputs to pages.tsx of inputsaw -> create tables for each decisionmaker
        // table has rows=criteria+2 and columns=alternatives+2

        // handle undefined inputs
        const alternatives = inputs?.alternatives ?? 0;
        const criteria = inputs?.criteria ?? 0;
        const decisionMakers = inputs?.decisionMakers ?? 1;


        // Construct query params
        const query = new URLSearchParams({
            decisionMakers: decisionMakers.toString(),
            alternatives: alternatives.toString(),
            criteria: criteria.toString(),
        }).toString();

        // Navigate to SWAPage with params
        router.push(`/groupdecision/inputswa?${query}`);


    };

    const handleButtonClick = () => {
        //proceed if inputs are defined
        if (inputs.criteria !== undefined && inputs.alternatives !== undefined) {
            handleNext(inputs); // pass the inputs object directly
        }
    };

    return (
        <GenericInputCard cardTitle={'Schritt 1: Nutzwerte berechnen (SAW)'}
                          inputChild={<SAWInputs inputs={inputs} onData={handleDataChange}/>}
                          buttonTitle={'generieren'} onClick={handleButtonClick} inputs={inputs}
                          onChange={handleDataChange}/>
    )

}

export type SWAInputCardProps = {
    inputs: InputProps;
    onData: (inputs: InputProps) => void;
}