import {GenericInputCard, InputProps} from "@/components/GenericInputCard";
import {SWAInputs} from "@/components/SWAInputs";
import {router} from "next/client";

export const SWAInputCard = ({inputs, onData}: SWAInputCardProps) => {

    const handleDataChange = (newInputs: InputProps) => {
        onData(newInputs);
    };

    const handleNext = (inputs: InputProps) => {
        // Initialize table with size from inputs
        // For example:
        // setTableSize(inputs.size);
    };

    const handleButtonClick = () => {
        handleNext(inputs); // pass the inputs object directly
        // then navigate
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