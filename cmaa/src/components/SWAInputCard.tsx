import {GenericInputCard, InputProps} from "@/components/GenericInputCard";
import {SWAInputs} from "@/components/SWAInputs";
import {useRouter} from "next/router";

export const SWAInputCard = ({inputs, onData}: SWAInputCardProps) => {

    const handleDataChange = (newInputs: InputProps) => {
        onData(newInputs);
    };

    const handleNext = (inputs: InputProps) => {
        // Initialize table with size from inputs
        // For example:
        // setTableSize(inputs.size);
        // send inputs to pages.tsx of inputswa
        // create as many tables as decicionMakers
        // table has rows=criteria +1
        // table has columns=alternatives+2

    };

    const handleButtonClick = () => {
        handleNext(inputs); // pass the inputs object directly
        // then navigate
        const router = useRouter();
        router.push("/groupdecision/inputswa")
    };

    return (
        <GenericInputCard cardTitle={'Nutzwertanalyse (SWA)'}
                          inputChild={<SWAInputs inputs={inputs} onData={handleDataChange}/>}
                          buttonTitle={'generieren'} onClick={handleButtonClick} inputs={inputs}
                          onChange={handleDataChange}/>
    )

}

export type SWAInputCardProps = {
    inputs: InputProps;
    onData: (inputs: InputProps) => void;
}