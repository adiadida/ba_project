'use client'

import {GenericHeader} from "@/components/generics/GenericHeader";
import {ReadonlyURLSearchParams, useSearchParams} from "next/navigation"; // useRouter hook should be imported from next/navigation
import React, {useEffect, useRef, useState} from "react";
import {Grid} from "@mui/material";
import seedrandom from "seedrandom";
import {testData} from "@/components/cmaa/TestData";
import {StatisticsAccordion} from "@/components/cmaa/StatisticsAccordion";
import {ClarificationInputs} from "@/components/clarificationConference/ClarificationInputs";
import {Recommendations} from "@/components/recommendations/Recommendations";
import {MetricsGrid} from "@/components/discussionMetrics/MetricsGrid";
import {GenericAccordion} from "@/components/generics/GenericAccordion";

export default function CAAPage() {

    // to get data from URL
    const searchParams = useSearchParams()

    // State to hold aggregated preferences
    const [aggregatedPreferences, setAggregatedPreferences] = useState<Set<number>[]>([]);

    // State to hold aggregated judgements
    const [aggregatedJudgements, setAggregatedJudgements] = useState<Set<number>[][]>([]);

    // State to hold rank acceptability counter
    const [rankAcceptabilityCounter, setRankAcceptabilityCounter] = useState<number[][]>([]);
    // State to hold rank acceptability indices
    const [rankAcceptabilityIndices, setRankAcceptabilityIndices] = useState<number[][]>([]);

    // state for preference multimatrix
    const [preferencesMultiInputs, setPreferencesMultiInputs] = useState<number[][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [bewertungsindex]
    // preferenceCircumstanceCounter
    const preferencesCircumstanceCounterRef = useRef<number[][][] | null>(null);

    // state for judgement multimatrix
    const [judgementsMultiInputs, setJudgementsMultiInputs] = useState<number[][][]>([]);

    // Ref for counter multimatrix - [a_i gewinne] [kriterienindex] [alternativenindex] [bewertungsindex]
    // judgementCircumstanceCounter
    const judgementsCircumstanceCounterRef = useRef<number[][][][] | null>(null);

    // --- for user feedback ---
    // count number of clarification conferences
    const [stepCounter, setStepCounter] = useState<number>(0);
    const [alternativeWinner, setAlternativeWinner] = useState<number>(0);
    const [chanceWinner, setChanceWinner] = useState<number>(0);

    //for debugging
    const dPrefsRef = useRef<number[][] | null>(null);
    const dJudgesRef = useRef<number[][][] | null>(null);

    // updating MultiInputs triggered by user input
    const [editedPrefs, setEditedPrefs] = useState<number[][]>([]);
    const [editedJudgements, setEditedJudgements] = useState<number[][][]>([]);
    const handlePreferenceChange = (newPrefs: number[][]) => setEditedPrefs(newPrefs);
    const handleJudgementChange = (newJudgements: number[][][]) => setEditedJudgements(newJudgements);

    // states for recommendations
    const [prefConsensusRec, setPrefConsensusRec] = useState<number[]>([]);
    const [judgConsensusRec, setJudgConsensusRec] = useState<number[][]>([]);
    const [prefDevelopmentRec, setPrefDevelopmentRec] = useState<number[][]>([]);
    const [judgDevelopmentRec, setJudgDevelopmentRec] = useState<number[][][]>([]);

    // compute data for first render
    useEffect(() => {

        // init RNG
        // use randomNumberGenerator with uniform chance for Monte Carlo simulations
        initializeGenerator(/*'4321'*/);

        // get initial input data
        let decisionMakerData = getDecisionMakerData(searchParams);

        // initialize some matrices
        let {
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityIndices,
            rankAcceptabilityCounter
        } = initPageStateData(decisionMakerData);

        // initialize MultiInputs
        const {
            preferencesMultiInputs,
            judgementsMultiInputs
        } = getMultiData(aggregatedPreferences, aggregatedJudgements);

        // initialize circumstance counters
        let {
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter
        } = getInitialCircCounters(aggregatedPreferences, aggregatedJudgements);

        // for UI
        let winner: number;
        let chance: number;
        let prefConsensusRec: number[];
        let judgConsensusRec: number[][];
        let prefDevelopmentRec: number[][];
        let judgDevelopmentRec: number[][][];

        // execute CMAA algorithm when all input parameters are properly set
        ({
            winner,
            chance,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            rankAcceptabilityCounter,
            prefConsensusRec,
            judgConsensusRec,
            prefDevelopmentRec,
            judgDevelopmentRec
        } = cMAA(
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityCounter,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            preferencesMultiInputs,
            judgementsMultiInputs,
            decisionMakerData
        ));

        setAggregatedPreferences(aggregatedPreferences);
        setAggregatedJudgements(aggregatedJudgements);
        setRankAcceptabilityCounter(rankAcceptabilityCounter);
        setRankAcceptabilityIndices(rankAcceptabilityIndices);
        setPreferencesMultiInputs(preferencesMultiInputs);
        setJudgementsMultiInputs(judgementsMultiInputs);
        preferencesCircumstanceCounterRef.current = preferencesCircumstanceCounter;
        judgementsCircumstanceCounterRef.current = judgementsCircumstanceCounter;
        setAlternativeWinner(winner);
        setChanceWinner(chance);
        setEditedPrefs(preferencesMultiInputs);
        setEditedJudgements(judgementsMultiInputs);
        // recommendations
        setPrefConsensusRec(prefConsensusRec);
        setJudgConsensusRec(judgConsensusRec);
        setPrefDevelopmentRec(prefDevelopmentRec);
        setJudgDevelopmentRec(judgDevelopmentRec);

    }, [searchParams]);

    // function that generates aggregations of decisionMakerData and initializes matrices for rank acceptability
    const initPageStateData = (decisionMakerData: { [oid: string]: any }): {
        aggregatedPreferences: Set<number>[],
        aggregatedJudgements: Set<number>[][],
        rankAcceptabilityCounter: number[][],
        rankAcceptabilityIndices: number[][]
    } => {
        const aggPrefs: Set<number>[] = getAggregatedPreferences(decisionMakerData);
        //console.log('Aggregated Preferences:', aggPrefs);

        const aggJudgs: Set<number>[][] = getAggregatedJudgements(decisionMakerData);
        //console.log('Aggregated Judgements:', aggJudgs);

        const initialRACounter: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        //console.log('Initial RAC:', initialRACounter);

        const initialRAIndices: number [][] = initializeRankAcceptabilityMatrix(decisionMakerData);
        //(initialRAIndices);

        return {
            aggregatedPreferences: aggPrefs,
            aggregatedJudgements: aggJudgs,
            rankAcceptabilityCounter: initialRACounter,
            rankAcceptabilityIndices: initialRAIndices
        };
    }

    // --- getting updated data and re-triggering cmaa
    const handleResend = () => {

        let decisionMakerData = getDecisionMakerData(searchParams);

        // initialize rank acceptability matrices
        let {
            rankAcceptabilityIndices,
            rankAcceptabilityCounter
        } = initPageStateData(decisionMakerData);

        // get aggregated inputs from edited inputs
        const aggregatedPreferences: Set<number>[] = reduceMultiPreferences(editedPrefs);
        const aggregatedJudgements: Set<number>[][] = reduceMultiJudgements(editedJudgements);

        // create multi inputs from aggregated inputs
        const {
            preferencesMultiInputs,
            judgementsMultiInputs
        } = getMultiData(aggregatedPreferences, aggregatedJudgements);

        // initialize circumstance counters
        let {
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter
        } = getInitialCircCounters(aggregatedPreferences, aggregatedJudgements);

        // information for UI
        let winner: number;
        let chance: number;
        let prefConsensusRec: number[];
        let judgConsensusRec: number[][];
        let prefDevelopmentRec: number[][];
        let judgDevelopmentRec: number[][][];

        // execute CMAA algorithm when all input parameters are properly set
        ({
            winner,
            chance,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            rankAcceptabilityCounter,
            prefConsensusRec,
            judgConsensusRec,
            prefDevelopmentRec,
            judgDevelopmentRec
        } = cMAA(
            aggregatedJudgements,
            aggregatedPreferences,
            rankAcceptabilityCounter,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            preferencesMultiInputs,
            judgementsMultiInputs,
            decisionMakerData
        ));

        // setter
        setAggregatedPreferences(aggregatedPreferences);
        setAggregatedJudgements(aggregatedJudgements);
        setRankAcceptabilityCounter(rankAcceptabilityCounter);
        setRankAcceptabilityIndices(rankAcceptabilityIndices);
        setPreferencesMultiInputs(preferencesMultiInputs);
        setJudgementsMultiInputs(judgementsMultiInputs);
        preferencesCircumstanceCounterRef.current = preferencesCircumstanceCounter;
        judgementsCircumstanceCounterRef.current = judgementsCircumstanceCounter;
        setAlternativeWinner(winner);
        setChanceWinner(chance);
        // recommendations
        setPrefConsensusRec(prefConsensusRec);
        setJudgConsensusRec(judgConsensusRec);
        setPrefDevelopmentRec(prefDevelopmentRec);
        setJudgDevelopmentRec(judgDevelopmentRec);

        // update stepCounter for number of clarification conferences
        setStepCounter(stepCounter + 1);
    };

    // --- Seeded RNG ---

    // UseRef to hold the seedrandom generator instance
    const rngRef = useRef<seedrandom.PRNG | null>(null);

    // Initialize the seedrandom generator once
    const initializeGenerator = (seed?: string) => {
        //fallback seed
        const superSeed: string = seed ?? 'bombastic1234whydontyouworkthisisveryweirdnosenseforthesenseless';
        rngRef.current = seedrandom(superSeed);
    };

    // Generate random number isBetween 0 and 1
    const getRandomNumber = (): number => {
        if (rngRef.current) {
            return rngRef.current();
        }
        // Fallback if RNG isn't initialized
        console.warn('RNG not initialized!');
        return Math.random(); // fallback to Math.random() as a safe default
    };

    // --- Generate Random Instance ---
    const generateRandomInstance = (aggrPreferences: Set<number>[], aggrJudgements: Set<number>[][], seed?: string) => {
        // Initialize generator if seed provided (rng already initialized otherwise)
        if (seed) {
            initializeGenerator(seed);
        }

        // for debugging - test uniformity
        //const dPrefs = dPrefsRef.current!;
        //const dJudges = dJudgesRef.current!;

        let preferences: number[] = [];

        // initiate preference array
        for (let i = 0; i < aggrPreferences.length; i++) {
            preferences[i] = 0;
        }

        //generate numbers from existing weights
        for (let i = 0; i < preferences.length; i++) {
            const cellWeights: number[] = Array.from(aggrPreferences[i]);
            const randIdx = Math.floor(getRandomNumber() * cellWeights.length);
            preferences[i] = cellWeights[randIdx];

            //for debugging
            //dPrefs[i][randIdx] += 1;

        }

        // initiate judgments matrix
        let judgements: number[][] = [];
        for (let i = 0; i < aggrJudgements.length; i++) {
            judgements[i] = [];
            for (let j = 0; j < aggrJudgements[i].length; j++) {
                judgements[i][j] = 0;
            }
        }

        // generate values from existing sets
        for (let i = 0; i < aggrJudgements.length; i++) { // iterate over criteria
            const row = aggrJudgements[i];
            for (let j = 0; j < aggrJudgements[i].length; j++) { // iterate over alternatives
                const cellJudgements: number[] = Array.from(row[j]);

                // index in range of numbers from set
                const randIdx: number = Math.floor(getRandomNumber() * cellJudgements.length);
                judgements[i][j] = cellJudgements[randIdx];
                //dJudges[i][j][randIdx] += 1;
            }
        }
        // update debugging counters
        //dPrefsRef.current = dPrefs;
        //dJudgesRef.current = dJudges;

        return {preferences, judgements};
    }

    // combinatorial multicriteria acceptability analysis
    function cMAA(aggregatedJudgements: Set<number>[][],
                  aggregatedPreferences: Set<number>[],
                  _rankAcceptabilityCounter: number[][],
                  _rankAcceptabilityIndices: number[][],
                  _preferencesCircumstanceCounter: number[][][],
                  _judgementsCircumstanceCounter: number[][][][],
                  preferencesMultiInputs: number[][],
                  judgementsMultiInputs: number[][][],
                  decisionMakerData: { [o: string]: any }
    ): {
        winner: number,
        chance: number,
        rankAcceptabilityIndices: number[][],
        preferencesCircumstanceCounter: number[][][],
        judgementsCircumstanceCounter: number[][][][],
        rankAcceptabilityCounter: number[][],
        prefConsensusRec: number[],
        judgConsensusRec: number[][],
        prefDevelopmentRec: number[][],
        judgDevelopmentRec: number[][][]
    } {
        // counters to get conditions for rank 1 from instances
        let preferencesCircumstanceCounter = _preferencesCircumstanceCounter;
        let judgementsCircumstanceCounter = _judgementsCircumstanceCounter;
        let rankAcceptabilityCounter = _rankAcceptabilityCounter;

        const kMonteCarlo = 10000;
        for (let k = 0; k < kMonteCarlo; k++) {
            const instance = generateRandomInstance(aggregatedPreferences, aggregatedJudgements);
            const ranks = generateRanking(instance.preferences, instance.judgements);
            ({
                preferencesCircumstanceCounter,
                judgementsCircumstanceCounter,
                rankAcceptabilityCounter
            } = updateCounterMatrices(
                instance.preferences,
                instance.judgements,
                ranks,
                preferencesCircumstanceCounter,
                judgementsCircumstanceCounter,
                rankAcceptabilityCounter,
                preferencesMultiInputs,
                judgementsMultiInputs));
        }

        // for debugging
        //console.log('d prefs ', dPrefsRef.current);
        //console.log('d judges', dJudgesRef.current);

        const {
            winner,
            chance,
            rankAcceptabilityIndices,
            prefEntropy,
            judgEntropy,
            prefSensitivities,
            judgSensitivities
        } = createStatistics(rankAcceptabilityCounter, kMonteCarlo, decisionMakerData, preferencesCircumstanceCounter, preferencesMultiInputs, judgementsCircumstanceCounter, judgementsMultiInputs);
        //console.log('rankAcceptabilityCounter ', rankAcceptabilityCounter);
        //console.log('rankAcceptabilityIndices ', rankAcceptabilityIndices);

        const {prefConsensusRecIdx, judgConsensusRecIdx} = getConsensusRecommendation(prefEntropy, judgEntropy);

        const {
            prefDevelopmentRecArray,
            judgDevelopmentRecArray
        } = getDevelopmentRecommendation(prefSensitivities, judgSensitivities)

        return {
            winner,
            chance,
            rankAcceptabilityIndices,
            preferencesCircumstanceCounter,
            judgementsCircumstanceCounter,
            rankAcceptabilityCounter,
            prefConsensusRec: prefConsensusRecIdx,
            judgConsensusRec: judgConsensusRecIdx,
            prefDevelopmentRec: prefDevelopmentRecArray,
            judgDevelopmentRec: judgDevelopmentRecArray
        };
    }

    // for debugging purposes
    const initializeDPrefs = () => {
        //for debugging - test uniformity
        let dPrefs: number[][] = []
        for (let i = 0; i < aggregatedPreferences.length; i++) {
            // for debugging
            const length = Array.from(aggregatedPreferences[i]).length ?? 1;
            dPrefs[i] = [];
            dPrefs[i] = Array(length).fill(0);
        }
        return dPrefs;
    }

    const initializeDJudges = () => {
        let dJudges: number[][][] = [];
        for (let i = 0; i < aggregatedJudgements.length; i++) {
            dJudges[i] = [];
            for (let j = 0; j < aggregatedJudgements[i].length; j++) {
                dJudges[i][j] = [];
                const length = Array.from(aggregatedJudgements[i][j]).length ?? 1;
                dJudges[i][j] = Array(length).fill(0);

            }
        }
        return dJudges;
    }

    // --- Checks ---
    /** unit testing
     // 1. each sum of row of judgements from alternatives = r1 of that altWinner
     // 2. each sum of row of preferences from criteria = r1 of that altWinner
     // 3. rai: sum of sums of rows = sum of sums of cols = number of alternatives


     // check if in range
     const isBetween = (x: number, min: number, max: number) => {
     return x >= min && x <= max;
     };

     function checkJudgements() {

     const errorMargin = 0;
     let checkSum = 0;
     let judgCounterSum = 0;
     // ! for error handling
     const judgCircCounter = judgementsCircumstanceCounterRef.current!;

     // error handling
     if (judgCircCounter === null) {
     return;
     }

     for (let altWinner = 0; altWinner < judgCircCounter.length; altWinner++) { // [a_i gewinne] // judgCircCounter[altWinner]

     checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col - rAC[alts][ranks]

     for (let crit = 0; crit < judgCircCounter[altWinner].length; crit++) { // [kriterienindex] // judgCircCounter[altWinner][crit]

     for (let alt = 0; alt < judgCircCounter[altWinner][crit].length; alt++) { // [alternativenindex] // judgCircCounter[altWinner][crit][alt]

     // needs to be reset for the sum of judgements for each alternative
     judgCounterSum = 0;

     for (let judgeIdx = 0; judgeIdx < judgCircCounter[altWinner][crit][alt].length; judgeIdx++) { // [bewertungsindex] // judgCircCounter[altWinner][crit][alt][judgeIdx]
     judgCounterSum += judgCircCounter[altWinner][crit][alt][judgeIdx];
     }

     if (!isBetween(checkSum, judgCounterSum - errorMargin, judgCounterSum + errorMargin)) {
     console.log('Judgement Counter Check failed');
     console.log('check sum ', checkSum, ' judg sum ', judgCounterSum);
     }

     }
     }
     }
     }

     function checkPreferences() {

     const errorMargin = 0;
     let checkSum = 0;
     let prefCounterSum = 0;

     // ! for error handling
     const prefCircCounter = preferencesCircumstanceCounterRef.current!;

     // error handling
     if (prefCircCounter === null) {
     return;
     }

     for (let altWinner = 0; altWinner < prefCircCounter.length; altWinner++) { // [a_i gewinne] // prefCircCounter[altWinner]

     checkSum = rankAcceptabilityCounter[altWinner][0]; // rank 1 is in first col - rAC[alts][ranks]

     for (let crit = 0; crit < prefCircCounter[altWinner].length; crit++) { // [kriterienindex] // prefCircCounter[altWinner][crit]

     // needs to be reset for the sum of preferences for each criterion
     prefCounterSum = 0;

     for (let prefIdx = 0; prefIdx < prefCircCounter[altWinner][crit].length; prefIdx++) { // [bewertungsindex] // prefCircCounter[altWinner][crit][prefIdx]
     prefCounterSum += prefCircCounter[altWinner][crit][prefIdx];
     }

     if (!isBetween(prefCounterSum, checkSum - errorMargin, checkSum + errorMargin)) {
     console.log('Preference Counter Check failed');
     console.log('check sum ', checkSum, ' prefCounte sum ', prefCounterSum);
     }
     }
     }
     }

     function checkRAI() {

     const numAlts = rankAcceptabilityIndices.length;

     const errorMargin = 0.01;
     const negMarginNumAlts = numAlts - errorMargin;
     const posMarginNumAlts = numAlts + errorMargin;

     let ranksSum = 0;
     let altsSum = 0;

     // sum up rows/alternatives
     for (let alt = 0; alt < numAlts; alt++) {

     let altSum = 0;
     for (let rank = 0; rank < numAlts; rank++) {
     altSum += rankAcceptabilityIndices[alt][rank];
     altsSum += rankAcceptabilityIndices[alt][rank];
     }
     // each sum of row needs to be approx. 1
     if (!isBetween(altSum, 1 - errorMargin, 1 + errorMargin) && altSum !== 0) {
     console.log('RAI check failed');
     console.log('alternative sum ', altSum)
     }
     }

     // sum up columns/ranks
     for (let rank = 0; rank < numAlts; rank++) {

     for (let alt = 0; alt < numAlts; alt++) {
     ranksSum += rankAcceptabilityIndices[alt][rank];
     }
     }

     // error handling: case of only initialized matrix
     if (altsSum === 0 && ranksSum === 0) {
     return;
     }

     if (!isBetween(altsSum, negMarginNumAlts, posMarginNumAlts) || !isBetween(ranksSum, negMarginNumAlts, posMarginNumAlts)) {
     console.log('RAI check failed');
     console.log(numAlts, altsSum, ranksSum);
     }
     }

     // unit testing
     useEffect(() => {

     // error handling - data structures need to be initialized
     if (
     preferencesMultiInputs.length > 0
     && judgementsMultiInputs.length > 0
     && rankAcceptabilityCounter.length > 0
     && rankAcceptabilityIndices.length > 0
     && preferencesCircumstanceCounterRef.current!.length > 0
     && judgementsCircumstanceCounterRef.current!.length > 0
     ) {
     checkJudgements();
     checkPreferences();
     checkRAI();
     }

     }, [rankAcceptabilityCounter, preferencesCircumstanceCounterRef.current, judgementsCircumstanceCounterRef.current, rankAcceptabilityIndices])

     **/
    // --- UI Rendering ---
    return (
        <Grid container spacing={2} alignItems="center">
            <GenericHeader title="Gruppenentscheidung - Dashboard"/>

            <Grid container margin={4}>
                {rankAcceptabilityIndices.length > 0 &&
                    (
                        <Grid container size={12}>
                            <MetricsGrid rankAcceptabilityIndices={rankAcceptabilityIndices}
                                         conferenceCounter={stepCounter}
                                         alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}/>
                        </Grid>

                    )}

                <Grid container size={12} margin={1} alignItems={"center"}>
                    {aggregatedJudgements && aggregatedJudgements.length > 0 && aggregatedPreferences && aggregatedPreferences.length > 0 && (

                        <GenericAccordion title={'Schritt 1: Konflikt auswählen und diskutieren'} child={
                            <Grid container size={12}>
                                <Recommendations
                                    aggPrefs={aggregatedPreferences}
                                    aggJudgements={aggregatedJudgements}
                                    prefConsensusRec={prefConsensusRec}
                                    judgConsensusRec={judgConsensusRec}
                                    prefDevelopmentRec={prefDevelopmentRec}
                                    judgDevelopmentRec={judgDevelopmentRec}
                                />
                            </Grid>}
                        />
                    )}
                </Grid>

                <Grid container size={12} margin={1} alignItems={"center"}>
                    {judgementsMultiInputs.length > 0 && preferencesMultiInputs.length > 0 && (

                        <GenericAccordion title={'Schritt 2: Ergebnis der Konflikt-Klärung festhalten'} child={
                            <Grid container size={12}>
                                <ClarificationInputs conferenceCounter={stepCounter}
                                                     alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}
                                                     handleResend={handleResend}
                                                     judgementMultiInputs={judgementsMultiInputs}
                                                     onJudgementChange={handleJudgementChange}
                                                     preferenceMultiInputs={preferencesMultiInputs}
                                                     onPreferenceChange={handlePreferenceChange}
                                />
                            </Grid>}
                        />

                    )}
                </Grid>

                <Grid container size={12} margin={1} alignItems={"center"}>

                    {
                        preferencesCircumstanceCounterRef.current &&
                        preferencesCircumstanceCounterRef.current.length > 0 &&

                        judgementsCircumstanceCounterRef.current &&
                        judgementsCircumstanceCounterRef.current.length > 0 &&
                        (
                            <StatisticsAccordion rankAcceptabilityIndices={rankAcceptabilityIndices}
                                                 rankAcceptabilityCounter={rankAcceptabilityCounter}
                                                 preferencesCircumstanceCounterRef={preferencesCircumstanceCounterRef.current!}
                                                 preferencesMultiInputs={preferencesMultiInputs}
                                                 judgementsCircumstanceCounterRef={judgementsCircumstanceCounterRef.current!}
                                                 judgementsMultiInputs={judgementsMultiInputs}/>
                        )}
                </Grid>

            </Grid>
        </Grid>
    );
}

function getDecisionMakerData(searchParams: ReadonlyURLSearchParams):
// decisionMakerData
    { [oid: string]: any } {
    if (searchParams === undefined) {
        return testData();
    }

    // let decisionMakerData: { [oid: string]: any };
    // parse data from URL params
    const newData: { [dmId: string]: any } = {};

    // newData[dmId] = {
    //   criteria: parsedData.criteria,
    //   weights: parsedData.weights,
    //   alt1 ... altn // other processed data
    // };

    // multiple dmIds or a single dmId parameter with multiple values
    /* example data:
    * inputcaa?data={"1"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A1%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A5%2C"alt1"%3A3%2C"alt2"%3A4%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A2%2C"alt1"%3A4%2C"alt2"%3A3%2C"alt3"%3A3}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A25%2C"alt2"%3A31%2C"alt3"%3A17%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A2%2C"alt2"%3A1%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]%2C"2"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A4%2C"alt1"%3A5%2C"alt2"%3A1%2C"alt3"%3A3}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A2%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A3%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A28%2C"alt2"%3A23%2C"alt3"%3A19%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]}
    * */
    // @ts-ignore
    searchParams.forEach((value, key) => {
        try {
            // Decode the URL-encoded string
            const decodedString = decodeURIComponent(value);
            // Parse the JSON string
            const parsedData = JSON.parse(decodedString);

            //key used as dmId
            // Generate data object for this key
            if (typeof parsedData === 'object' && parsedData !== null) {
                newData[key] = parsedData;
            } else {
                console.warn(`Parsed data for ${key} is not an object.`);
            }
        } catch (error) {
            console.error(`Error parsing data for ${key}:`, error);
        }
    });

    if (Object.keys(newData).length === 0) {
        // Use testData if no data in URL
        const fallbackData = testData(); // get the 'data' object from testData
        //console.log('test Data:', fallbackData);
        return fallbackData;
    } else {
        //from URL generated data
        return newData;
    }
}

// interface row object
interface Row {
    id: number;
    criteria: string;
    weight: number | undefined;

    [p: string]: any;
}

function getAggregatedPreferences(data: { [oid: string]: any }):
// aggPreferencesArray ... array for each criterion m  = a set of unique values from decisionMaker preferences
    Set<number>[] {

    // array of Set<number> = unique
    let aggPreferences: Set<number>[] = [];

    // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
    const dmData = Object.values(data);

    // error handling
    if (dmData.length === 0) {
        return aggPreferences;
    }

    // from the first decision maker - first array of row objects
    const firstDM: Row[] = dmData[0][1];

    // Extract criteria keys
    const criteriaArray: string[] = []; // Set has unique values
    firstDM.forEach((object: Row) => {
        if (object.id !== 1000 && object.id !== 1001) {
            criteriaArray.push(object.criteria);
        }
    })

    // Initialize aggPreferences
    criteriaArray.forEach(() => {
        aggPreferences.push(new Set<number>)
    });

    const decisionMakers = dmData[0]; // contains object array for each decision maker

    for (const dmID of Object.keys(decisionMakers)) { // iterate over decision makers
        const decisionMaker = decisionMakers[dmID];

        // set weight for each criterion
        for (let row = 0; row < aggPreferences.length; row++) { // iterate over rows
            const decisionRow = decisionMaker[row];
            if (!decisionRow) continue; // Skip if decisionRow is undefined or null

            if (
                criteriaArray[row] === decisionRow.criteria &&
                typeof decisionRow.weight === 'number'
            ) {
                // add preference weight to set
                aggPreferences[row].add(decisionRow.weight);
            }

        }
    }

    return aggPreferences;
    /*
     returns with example data:
     [
        0: Set [1,4] // is "criterion 1"
        1: Set [5,2] // is "criterion 2"
        2: Set [2,3] // is "criterion 2"
    ]
    */
}

function getAggregatedJudgements(data: { [oid: string]: any }):
// aggJudgementMatrix ... Matrix for each criterion m and for each alternative n = a set of unique values from decisionMaker judgements
    Set<number>[][] {
    // matrix or 2-dimensional array of Set<number> = unique
    let aggJudgements: Set<number>[][] = [];
    // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
    const dmData = Object.values(data);

    // error handling
    if (dmData.length === 0) {
        return aggJudgements;
    }

    // from the first decision maker - first array of row objects
    const firstDM: Row[] = dmData[0][1];
    // get criteria
    const criteriaArray: string[] = [];
    firstDM.forEach((object: Row) => {
        if (object.id !== 1000 && object.id !== 1001) {
            criteriaArray.push(object.criteria);
        }
    })
    // from first row of first decision maker
    const firstRow: Row = firstDM[0];
    // get alternatives
    const alternativesArray: string[] = [];
    // Extract keys starting with 'alt'
    Object.keys(firstRow).forEach((key) => {
        if (key.startsWith('alt')) {
            alternativesArray.push(key);
        }
    });

    const criteriaCount = criteriaArray.length;
    const alternativesCount = alternativesArray.length;

    // Initialize the array with empty sets
    for (let row = 0; row < criteriaCount; row++) {
        aggJudgements[row] = [];
        for (let col = 0; col < alternativesCount; col++) {
            aggJudgements[row][col] = new Set<number>();
        }
    }

    const decisionMakers = dmData[0]; // contains an object array for each decision maker

    for (const dmID of Object.keys(decisionMakers)) { // iterate over decision makers
        const decisionMaker = decisionMakers[dmID];

        // set weight for each criterion
        for (let row = 0; row < criteriaCount; row++) { // iterate over rows = criteria
            const decisionRow = decisionMaker[row];

            for (let col = 0; col < alternativesCount; col++) { // iterate over cols = alternatives
                if (
                    criteriaArray[row] === decisionRow.criteria && alternativesArray[col] !== undefined
                ) {
                    const altkey: string = alternativesArray[col];
                    aggJudgements[row][col].add(decisionRow[altkey])
                }
            }

        }
    }

    return aggJudgements;

}

function getMultiData(aggregatedPreferences: Set<number>[], aggregatedJudgements: Set<number>[][]): {
    preferencesMultiInputs: number[][],
    judgementsMultiInputs: number[][][]
} {
    const preferencesMultiInputs = initializeMultiPreferences(aggregatedPreferences);
    const judgementsMultiInputs = initializeMultiJudgements(aggregatedJudgements);

    return {preferencesMultiInputs, judgementsMultiInputs};
}

function initializeMultiPreferences(aggregatedPreferences: Set<number>[]):
    number[][] {
    // [criterion] [preference]
    let preferencesInputs: number[][] = [];

    for (let crit = 0; crit < aggregatedPreferences.length; crit++) {
        const prefs = Array.from(aggregatedPreferences[crit]).sort(); // convert Set into sorted array
        preferencesInputs[crit] = [];

        for (let prefIdx = 0; prefIdx < prefs.length; prefIdx++) {
            preferencesInputs[crit][prefIdx] = prefs[prefIdx];
        }
    }

    return preferencesInputs;
}

function initializeMultiJudgements(aggregatedJudgements: Set<number>[][]):
    number[][][] {
    // [criterion][alternative][judgement]
    let judgementsInputs: number[][][] = [];

    for (let crit = 0; crit < aggregatedJudgements.length; crit++) {
        judgementsInputs[crit] = [];
        for (let alt = 0; alt < aggregatedJudgements[crit].length; alt++) {
            judgementsInputs[crit][alt] = [];

            const judgs = Array.from(aggregatedJudgements[crit][alt]).sort(); // convert set into sorted array
            judgementsInputs[crit][alt] = judgs;
        }
    }

    return judgementsInputs;
}

function reduceMultiPreferences(editedPrefs: number[][]):
    Set<number>[] {
    // build aggregated preferences by reducing current MultiInputs

    const reducedMultiPrefs: Set<number>[] = [];
    for (let i = 0; i < editedPrefs.length; i++) {
        reducedMultiPrefs[i] = new Set<number>();
        for (let j = 0; j < editedPrefs[i].length; j++) {
            if (
                editedPrefs[i][j] !== undefined &&
                !Number.isNaN(editedPrefs[i][j])
            ) {
                reducedMultiPrefs[i].add(editedPrefs[i][j]);
            }
        }
    }
    return reducedMultiPrefs;
}

function reduceMultiJudgements(editedJudgements: number[][][]):
    Set<number>[][] {
    // build aggregated judgements by reducing current MultiInputs

    const reducedMultiJudgements: Set<number>[][] = [];
    for (let i = 0; i < editedJudgements.length; i++) {
        reducedMultiJudgements[i] = [];
        for (let j = 0; j < editedJudgements[i].length; j++) {
            reducedMultiJudgements[i][j] = new Set<number>();
            for (let k = 0; k < editedJudgements[i][j].length; k++) {
                if (
                    editedJudgements[i][j][k] !== undefined &&
                    !Number.isNaN(editedJudgements[i][j][k])
                ) {
                    reducedMultiJudgements[i][j].add(editedJudgements[i][j][k]);
                }
            }
        }
    }
    return reducedMultiJudgements;
}

function initializeRankAcceptabilityMatrix(data: { [oid: string]: any }):
    number[][] {
    // needed for statistics -> rank acceptability counter + indices
    // rows are implicitly a1...ai alternatives and cols are implicitly r1 ... rj ranks
    let rankAcceptabilityMatrix: number[][] = [];

    // check if data isEmpty -  data is object with oid --> that object then contains object arrays of decision maker data
    const dmData = Object.values(data);

    // error handling
    if (dmData.length === 0) {
        return rankAcceptabilityMatrix;
    }
    const firstRow: Row = dmData[0][1][0];
    const alternativesArray: string[] = [];
    // Extract keys starting with 'alt'
    Object.keys(firstRow).forEach((key) => {
        if (key.startsWith('alt')) {
            alternativesArray.push(key);
        }
    });

    // Matrix is ixj with i=j... number of alternatives
    for (let i = 0; i < alternativesArray.length; i++) {
        rankAcceptabilityMatrix[i] = [];
        for (let j = 0; j < alternativesArray.length; j++) {
            rankAcceptabilityMatrix[i][j] = 0;
        }
    }

    return rankAcceptabilityMatrix;
}

function getInitialCircCounters(aggregatedPreferences: Set<number>[], aggregatedJudgements: Set<number>[][]): {
    preferencesCircumstanceCounter: number[][][],
    judgementsCircumstanceCounter: number[][][][]
} {
    const preferencesCircumstanceCounter = initializePreferencesCircumstanceCounter(aggregatedPreferences, aggregatedJudgements);
    const judgementsCircumstanceCounter = initializeJudgementsCircumstanceCounter(aggregatedJudgements);


    return {preferencesCircumstanceCounter, judgementsCircumstanceCounter};
}

function initializePreferencesCircumstanceCounter(aggregatedPreferences: Set<number>[], aggregatedJudgements: Set<number>[][]):
    number[][][] {
    // initialize Counter
    let prefCircCounter: number[][][] = [];

    const numAlts = aggregatedJudgements[0].length; // information only in judgements

    for (let altWinner = 0; altWinner < numAlts; altWinner++) { // [a_i gewinne]

        prefCircCounter[altWinner] = []

        for (let crit = 0; crit < aggregatedPreferences.length; crit++) { // [kriterienindex]
            prefCircCounter[altWinner][crit] = [];

            const numPrefs = Array.from(aggregatedPreferences[crit]).length ?? 1;
            for (let prefIdx = 0; prefIdx < numPrefs; prefIdx++) { // [bewertungsindex]
                prefCircCounter[altWinner][crit][prefIdx] = 0;
            }
        }
    }
    return prefCircCounter;
}

function initializeJudgementsCircumstanceCounter(aggregatedJudgements: Set<number>[][]):
    number[][][][] {
    // initialize Counter
    let judgCircCounter: number[][][][] = [];

    const numAlts = aggregatedJudgements[0].length;
    const numCrits = aggregatedJudgements.length;

    for (let altWinner = 0; altWinner < numAlts; altWinner++) { // [a_i gewinne]

        judgCircCounter[altWinner] = [];

        for (let crit = 0; crit < numCrits; crit++) { // [kriterienindex]
            judgCircCounter[altWinner][crit] = [];

            for (let alt = 0; alt < numAlts; alt++) { // [alternativenindex]
                judgCircCounter[altWinner][crit][alt] = [];

                const numJudgements = aggregatedJudgements[crit][alt].size;
                for (let judgeIdx = 0; judgeIdx < numJudgements; judgeIdx++) { // [bewertungsindex]

                    judgCircCounter[altWinner][crit][alt][judgeIdx] = 0;
                }
            }
        }
    }
    return judgCircCounter;
}

/**
 * Simple additive weighting solver: returns weighted sums = performances of each alternative
 */
function generatePerformances(preferences: number[], judgements: number[][]):
    number[] {
    const performances: number[] = [];

    // getting number of alternatives from first col
    const numberAlts = judgements[0]?.length ?? 0; // assuming all criteria arrays are of same length
    const numberCrits = judgements?.length ?? 0;

    // iterate over cols = alternatives
    for (let alternative = 0; alternative < numberAlts; alternative++) {
        let sum = 0;
        // weighted sum for each criterion
        for (let criterion = 0; criterion < numberCrits; criterion++) {
            sum += judgements[criterion][alternative] * preferences[criterion];
        }
        performances[alternative] = sum;
    }

    return performances;
}

/**
 * Generate ranking based on weighted sum = performance of alternative
 * highest performance ... rank 1
 */
function generateRanking(preferences: number[], judgements: number [][]):
    number[] {

    if (preferences.length === 0 || judgements.length === 0) {
        return [];
    }

    // get performances of every alternative
    const performances: number[] = generatePerformances(preferences, judgements);
    //console.log('weighted sums: ', performances);

    // Create an array of alternatives with their performances
    const alternatives = performances.map((performance, index) => ({index, performance}));

    // Sort alternatives in descending order of performance
    alternatives.sort((a, b) => b.performance - a.performance);

    // Extract sorted alternative indices as ranking
    const rankings = alternatives.map(alternative => alternative.index + 1);
    //console.log('rankings ', rankings);

    return rankings;

}

function updateCounterMatrices(preferences: number[],
                               judgements: number[][],
                               altsByRank: number[],
                               preferencesCircumstanceCounter: number[][][],
                               judgementsCircumstanceCounter: number[][][][],
                               rankAcceptabilityCounter: number[][],
                               preferencesMultiInputs: number[][],
                               judgementsMultiInputs: number[][][]): {
    rankAcceptabilityCounter: number[][],
    preferencesCircumstanceCounter: number[][][],
    judgementsCircumstanceCounter: number[][][][]
} {

    // --- update counter for rank of alternatives of simulated instance
    const rankAccsCounter = updateRankAcceptabilityCounter(altsByRank, rankAcceptabilityCounter)

    // rank 1 is at index 0 --> altWinner+1 is in altsByRank[0] --> that is the winner of instance
    const altWinner = altsByRank[0] - 1; // altWinner is correctly initialised with the index of the winner alternative

    // --- update counter for preference of winner from simulated instance
    preferencesCircumstanceCounter = updatePrefCircCounter(preferencesCircumstanceCounter, altWinner, preferences, preferencesMultiInputs);

    // --- update counter for judgements of winner from simulated instance
    judgementsCircumstanceCounter = updateJudgeCircCounter(judgementsCircumstanceCounter, altWinner, judgements, judgementsMultiInputs);

    return {rankAcceptabilityCounter: rankAccsCounter, preferencesCircumstanceCounter, judgementsCircumstanceCounter};

}

function updateRankAcceptabilityCounter(altsByRank: number[],
                                        rankAcceptabilityCounter: number[][]):
    number[][] {
    // deep copy
    const rankAccs: number[][] = structuredClone(rankAcceptabilityCounter);

    let alternative: number = 0;

    // altsByRank = array where index is implicitly the rank, the alternative is in altsByRank[idx]
    for (let rank = 0; rank < altsByRank.length; rank++) {
        alternative = altsByRank[rank] - 1; // alternative at rank -1 is row index in rankAccs
        rankAccs[alternative][rank] += 1;
    }
    return rankAccs;
}

function updatePrefCircCounter(prefCircCounter: number[][][], altWinner: number, preferences: number[], preferencesMultiInputs: number[][]): number[][][] {

    // deep copy
    let newPrefCircCounter: number[][][] = structuredClone(prefCircCounter);

    for (let crit = 0; crit < newPrefCircCounter[altWinner].length; crit++) { // [kriterienindex]

        for (let prefIdx = 0; prefIdx < newPrefCircCounter[altWinner][crit].length; prefIdx++) { // [bewertungsindex]

            if (preferences[crit] === preferencesMultiInputs[crit][prefIdx]) {
                newPrefCircCounter[altWinner][crit][prefIdx] += 1;
            }
        }
    }

    return newPrefCircCounter;
}

function updateJudgeCircCounter(judgCircCounter: number[][][][], altWinner: number, judgements: number[][], judgementsMultiInputs: number[][][]): number[][][][] {

    // deep copy
    let newJudgCircCounter = structuredClone(judgCircCounter);


    for (let crit = 0; crit < newJudgCircCounter[altWinner].length; crit++) { // [kriterienindex]

        for (let alt = 0; alt < newJudgCircCounter[altWinner][crit].length; alt++) { // [alternativenindex]

            for (let judgeIdx = 0; judgeIdx < newJudgCircCounter[altWinner][crit][alt].length; judgeIdx++) { // [bewertungsindex]

                if (judgements[crit][alt] === judgementsMultiInputs[crit][alt][judgeIdx]) {
                    newJudgCircCounter[altWinner][crit][alt][judgeIdx] += 1;
                }
            }

        }
    }

    return newJudgCircCounter;
}

function createStatistics(rankAcceptabilityCounter: number[][], kMC: number,
                          decisionMakerData: { [o: string]: any },
                          prefCircumstanceCounter: number[][][],
                          preferenceMultiInputs: number[][],
                          judgCircumstanceCounter: number[][][][],
                          judgementsMultiInputs: number[][][],
): {
    winner: number,
    chance: number,
    rankAcceptabilityIndices: number[][],
    currentPrefAcceptabilities: number[][][],
    potentialPrefAcceptabilities: number[][][],
    prefEntropy: number[][],
    currentJudgAcceptabilities: number[][][][],
    potentialJudgAcceptabilities: number[][][][],
    judgEntropy: number[][][],
    prefSensitivities: number[][][],
    judgSensitivities: number[][][][]
} {

    const rankAcceptabilityIndices = createRankAcceptabilityIndices(decisionMakerData, rankAcceptabilityCounter, kMC)

    const currentPrefAcceptabilities = computeCurrentPrefAcceptability(prefCircumstanceCounter, kMC);
    const potentialPrefAcceptabilities = computePotentialPrefAcceptability(currentPrefAcceptabilities, prefCircumstanceCounter);
    const prefEntropy = computePreferenceEntropy(potentialPrefAcceptabilities, preferenceMultiInputs, prefCircumstanceCounter);

    const currentJudgAcceptabilities = computeCurrentJudgAcceptability(judgCircumstanceCounter, kMC);
    const potentialJudgAcceptabilities = computePotentialJudgAcceptability(currentJudgAcceptabilities, judgCircumstanceCounter);
    const judgEntropy = computeJudgementEntropy(potentialJudgAcceptabilities, judgementsMultiInputs, judgCircumstanceCounter);

    const {
        prefSensitivities,
        judgSensitivities
    } = getSensitivityAnalysis(rankAcceptabilityIndices, prefCircumstanceCounter, potentialPrefAcceptabilities, judgCircumstanceCounter, potentialJudgAcceptabilities)


    const {winner, chance} = getWinnerAndChance(rankAcceptabilityIndices);

    return {
        winner,
        chance,
        rankAcceptabilityIndices,
        currentPrefAcceptabilities,
        potentialPrefAcceptabilities,
        prefEntropy,
        currentJudgAcceptabilities,
        potentialJudgAcceptabilities,
        judgEntropy,
        prefSensitivities,
        judgSensitivities,
    }

}

function createRankAcceptabilityIndices(decisionMakerData: {
    [o: string]: any
}, rankAcceptabilityCounter: number[][], kMC: number):
    number[][] {
    // initialize an empty rank acceptability indices matrix
    const rankAcceptabilityIndices = initializeRankAcceptabilityMatrix(decisionMakerData);

    // shallow copy
    const counterMatrix = rankAcceptabilityCounter;

    // variation without kMC
    // iterate over 1 col and rows + sum up number of instances
    /*let sum = 0;
    for (let j = 0; j < counterMatrix[0].length; j++) {
        sum += counterMatrix[0][j];
    }
    */

    // normalize counters with sum of instances
    for (let i = 0; i < rankAcceptabilityIndices.length; i++) {
        for (let j = 0; j < rankAcceptabilityIndices[i].length; j++) {
            rankAcceptabilityIndices[i][j] = counterMatrix[i][j] / kMC;
        }
    }

    return rankAcceptabilityIndices;
}

// needed for UI
function getWinnerAndChance(rankAcceptabilityIndices: number[][]): {
    winner: number,
    chance: number,
} {

    // needed for user feedback in ExitModal

    let winner: number = -1; // is alternative with highest chance of being rank one
    let chance: number = -1; // probability of winner alernative

    let rankOne = [];
    for (let i = 0; i < rankAcceptabilityIndices.length; i++) {
        rankOne.push(rankAcceptabilityIndices[i][0])
    }
    //console.log(rankOne);

    for (let i = 0; i < rankOne.length; i++) {
        if (chance < rankOne[i]) {
            chance = rankOne[i];
            winner = i + 1;
        }
    }

    chance = Math.round(chance * 100);
    return {winner, chance};
}

// --- preference statistics
const initializePrefAcceptability = (prefCircumstanceCounter: number[][][]): number[][][] => {

    let prefAcceptability: number[][][] = [];


    for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
        prefAcceptability[altWinner] = [];

        for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {
            prefAcceptability[altWinner][crit] = [];

            for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {
                prefAcceptability[altWinner][crit][prefIdx] = 0;
            }
        }
    }

    return prefAcceptability;
}

// compute current pref acceptability (= preferenceCounter/k)
// calculates current acceptability by normalizing counts over kMonteCarlo
// -> becomes probability/distribution
function computeCurrentPrefAcceptability(prefCircumstanceCounter: number[][][], kMonteCarlo: number): number[][][] {

    let currentPrefAcceptability = initializePrefAcceptability(prefCircumstanceCounter);

    for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {

        for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {

            for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {
                currentPrefAcceptability[altWinner][crit][prefIdx] = prefCircumstanceCounter[altWinner][crit][prefIdx] / kMonteCarlo;
            }
        }
    }

    return currentPrefAcceptability;
}

// compute potential preference acceptability (for each pot preference acceptability sum up that preference acceptability from each aWinner and compute pot preference acc/sum)
// normalizes current acceptability across alternatives for each preference
// -> normalized probability/distribution
function computePotentialPrefAcceptability(currPrefAcceptability: number[][][], prefCircumstanceCounter: number[][][]): number[][][] {

    // shallow copy
    const currPrefAcc = currPrefAcceptability;
    let potentialPrefAcceptability = initializePrefAcceptability(prefCircumstanceCounter);


    // error handling
    if (isNaN(currPrefAcc[0][0][0]) || !isFinite(currPrefAcc[0][0][0])) {
        console.log('potential preference acceptability is NaN or infinity');
        return potentialPrefAcceptability;
    }


    /*let sums = initializePreferenceEntropy(); // is 2-dim array
    // sum up current potential acceptability over all altWinners
    for (let crit = 0; crit < sums.length; crit++) {
        for (let prefIdx = 0; prefIdx < sums[crit].length; prefIdx++) {

        }
    }*/

    for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {

        for (let crit = 0; crit < prefCircumstanceCounter[altWinner].length; crit++) {

            for (let prefIdx = 0; prefIdx < prefCircumstanceCounter[altWinner][crit].length; prefIdx++) {

                // sum for normalization
                let sum = 0;
                for (let alt = 0; alt < prefCircumstanceCounter.length; alt++) {
                    sum += currPrefAcc[alt][crit][prefIdx];
                }

                potentialPrefAcceptability[altWinner][crit][prefIdx] = currPrefAcc[altWinner][crit][prefIdx] / sum;
            }
        }
    }

    return potentialPrefAcceptability;
}

const initializePreferenceEntropy = (preferenceMultiInputs: number[][]): number[][] => {
    let prefEntropy: number[][] = [];

    for (let crit = 0; crit < preferenceMultiInputs.length; crit++) {
        prefEntropy[crit] = [];
        for (let prefIdx = 0; prefIdx < preferenceMultiInputs[crit].length; prefIdx++) {
            prefEntropy[crit][prefIdx] = 0;
        }
    }

    return prefEntropy;
}

// loop over potential pref acceptability and compute preference entropy
// calculates Shannon entropy for the potential preference acceptability distributions
function computePreferenceEntropy(potPrefAcceptability: number[][][], preferenceMultiInputs: number[][], prefCircumstanceCounter: number[][][]): number[][] {
    const potPrefAcc = potPrefAcceptability;
    let preferenceEntropy: number[][] = initializePreferenceEntropy(preferenceMultiInputs);


    for (let crit = 0; crit < preferenceMultiInputs.length; crit++) {

        for (let prefIdx = 0; prefIdx < preferenceMultiInputs[crit].length; prefIdx++) {

            let sumPotPref = 0;
            for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
                sumPotPref += potPrefAcc[altWinner][crit][prefIdx];
            }

            // Compute entropy for this criterion and preference index
            let entropy = 0;
            if (sumPotPref > 0) {
                for (let altWinner = 0; altWinner < prefCircumstanceCounter.length; altWinner++) {
                    const p = potPrefAcc[altWinner][crit][prefIdx] / sumPotPref;
                    if (p > 0) {
                        entropy -= p * Math.log2(p);
                    }
                }
            }
            preferenceEntropy[crit][prefIdx] = entropy;
        }
    }
    return preferenceEntropy;
}

// --- judgement statistics
function initializeJudgementAcceptability(judgCircumstanceCounter: number[][][][]): number[][][][] {
    let judgAcceptability: number[][][][] = [];

    for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
        judgAcceptability[altWinner] = [];

        for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {
            judgAcceptability[altWinner][crit] = [];

            for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {
                judgAcceptability[altWinner][crit][alt] = [];

                for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {
                    judgAcceptability[altWinner][crit][alt][judgIdx] = 0;
                }
            }
        }
    }

    return judgAcceptability;
}

// calculates current acceptability by normalizing counts over kMonteCarlo
// -> becomes probability/distribution
function computeCurrentJudgAcceptability(judgCircumstanceCounter: number[][][][], kMonteCarlo: number): number[][][][] {

    let currentJudgAcceptability: number[][][][] = initializeJudgementAcceptability(judgCircumstanceCounter);

    for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {

        for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {

            for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {

                for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {
                    currentJudgAcceptability[altWinner][crit][alt][judgIdx] = judgCircumstanceCounter[altWinner][crit][alt][judgIdx] / kMonteCarlo;

                }
            }

        }
    }
    return currentJudgAcceptability;
}

// normalizes current acceptability across alternatives for each preference
// -> normalized probability/distribution
function computePotentialJudgAcceptability(currJudgAcceptability: number[][][][], judgCircumstanceCounter: number[][][][]): number[][][][] {

    const currJudgAcc = currJudgAcceptability;
    let potentialJudgAcceptability = initializeJudgementAcceptability(judgCircumstanceCounter);


    // error handling
    if (isNaN(currJudgAcc[0][0][0][0]) || !isFinite(currJudgAcc[0][0][0][0])) {
        console.log('potential preference acceptability is NaN or infinity');
        return potentialJudgAcceptability;
    }

    for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {

        for (let crit = 0; crit < judgCircumstanceCounter[altWinner].length; crit++) {

            for (let alt = 0; alt < judgCircumstanceCounter[altWinner][crit].length; alt++) {

                for (let judgIdx = 0; judgIdx < judgCircumstanceCounter[altWinner][crit][alt].length; judgIdx++) {

                    // sum for normalization
                    let sum = 0;
                    for (let aWinner = 0; aWinner < judgCircumstanceCounter.length; aWinner++) {
                        sum += currJudgAcc[aWinner][crit][alt][judgIdx];
                    }

                    potentialJudgAcceptability[altWinner][crit][alt][judgIdx] = currJudgAcc[altWinner][crit][alt][judgIdx] / sum;

                }
            }
        }
    }

    return potentialJudgAcceptability;
}

const initializeJudgementEntropy = (judgementsMultiInputs: number[][][]): number[][][] => {
    let judgEntropy: number[][][] = [];

    for (let crit = 0; crit < judgementsMultiInputs.length; crit++) {
        judgEntropy[crit] = [];
        for (let alt = 0; alt < judgementsMultiInputs[crit].length; alt++) {
            judgEntropy[crit][alt] = [];
            for (let judgIdx = 0; judgIdx < judgementsMultiInputs[crit][alt].length; judgIdx++) {
                judgEntropy[crit][alt][judgIdx] = 0;
            }
        }

    }

    return judgEntropy;
}

// loop over potential pref acceptability and compute judgement entropy
// calculates Shannon entropy for the potential judgement acceptability distributions
function computeJudgementEntropy(potJudgAcceptability: number[][][][], judgementsMultiInputs: number[][][], judgCircumstanceCounter: number[][][][]) {
    // shallow copy
    const potJudgAcc = potJudgAcceptability;
    let judgementEntropy: number[][][] = initializeJudgementEntropy(judgementsMultiInputs);


    for (let crit = 0; crit < judgementsMultiInputs.length; crit++) {

        for (let alt = 0; alt < judgementsMultiInputs[crit].length; alt++) {

            for (let judgIdx = 0; judgIdx < judgementsMultiInputs[crit][alt].length; judgIdx++) {


                let sumPotJudg = 0;
                for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
                    sumPotJudg += potJudgAcc[altWinner][crit][alt][judgIdx];
                }

                // Compute entropy for this criterion and preference index
                let entropy = 0;
                if (sumPotJudg > 0) {
                    for (let altWinner = 0; altWinner < judgCircumstanceCounter.length; altWinner++) {
                        const p = potJudgAcc[altWinner][crit][alt][judgIdx] / sumPotJudg;
                        if (p > 0) {
                            entropy -= p * Math.log2(p);
                        }
                    }
                }
                judgementEntropy[crit][alt][judgIdx] = entropy;
            }
        }

    }
    return judgementEntropy;
}

function getSensitivityAnalysis(rankAcceptabilityIndices: number[][], prefCircumstanceCounter: number[][][], potentialPrefAcceptability: number[][][], judgCircumstanceCounter: number[][][][], potentialJudgAcceptability: number[][][][]): {
    prefSensitivities: number[][][],
    judgSensitivities: number[][][][]
} {

    let rankOne = [];
    for (let i = 0; i < rankAcceptabilityIndices.length; i++) {
        rankOne.push(rankAcceptabilityIndices[i][0])
    }

    // Sensitivity = potential - rank 1 of winnerAlternative --> max

    const prefSensitivities = computePrefSensitivity(rankOne, prefCircumstanceCounter, potentialPrefAcceptability);

    const judgSensitivities = computeJudgSensitivity(rankOne, judgCircumstanceCounter, potentialJudgAcceptability);

    return {prefSensitivities, judgSensitivities}
}

function computePrefSensitivity(rankOne: number[], prefCircumstanceCounter: number[][][], potentialPrefAcceptability: number[][][]): number[][][] {
    const prefSensitivities = initializePrefAcceptability(prefCircumstanceCounter);

    for (let altWinner = 0; altWinner < potentialPrefAcceptability.length; altWinner++) {
        for (let criterion = 0; criterion < potentialPrefAcceptability[altWinner].length; criterion++) {
            for (let prefIdx = 0; prefIdx < potentialPrefAcceptability[altWinner][criterion].length; prefIdx++) {
                prefSensitivities[altWinner][criterion][prefIdx] = potentialPrefAcceptability[altWinner][criterion][prefIdx] - rankOne[altWinner];
            }
        }
    }

    return prefSensitivities;
}

function computeJudgSensitivity(rankOne: number[], judgCircumstanceCounter: number[][][][], potentialJudgAcceptability: number[][][][]): number[][][][] {
    const judgSensitivities: number[][][][] = initializeJudgementAcceptability(judgCircumstanceCounter);

    for (let altWinner = 0; altWinner < potentialJudgAcceptability.length; altWinner++) {
        for (let criterion = 0; criterion < potentialJudgAcceptability[altWinner].length; criterion++) {
            for (let alternative = 0; alternative < potentialJudgAcceptability[altWinner][criterion].length; alternative++) {
                for (let judgIdx = 0; judgIdx < potentialJudgAcceptability[altWinner][criterion][alternative].length; judgIdx++) {
                    judgSensitivities[altWinner][criterion][alternative][judgIdx] = potentialJudgAcceptability[altWinner][criterion][alternative][judgIdx] - rankOne[altWinner];
                }
            }

        }
    }

    return judgSensitivities;
}

function getConsensusRecommendation(prefEntropy: number[][], judgEntropy: number[][][]): {
    prefConsensusRecIdx: number[];
    judgConsensusRecIdx: number[][];
} {

    const prefValues = prefEntropy.flat();
    const prefRec = getBestThreePlusBackupThree(prefValues);

    // rank of entropy  in implicit criterion
    const prefRecIdx: number[] = getPrefRecIdxArray(prefRec, prefEntropy);

    const judgValues = judgEntropy.flat().flat();
    const judgRec = getBestThreePlusBackupThree(judgValues);

    // rank of entropy in implicit  criterion, alternative
    const judgRecIdx: number[][] = getJudgRecIdxArray(judgRec, judgEntropy);

    return {prefConsensusRecIdx: prefRecIdx, judgConsensusRecIdx: judgRecIdx}
}

function getBestThreePlusBackupThree(values: number[]): number[] {
    // sort shallow copy of values ascending
    const sorted = [...values].sort((n1, n2) => n1 - n2);
    let bestThree: number[] = sorted.slice(0, 6);
    return bestThree;
}

function getPrefRecIdxArray(prefRec: number[], prefStatistics: number[][]): number[] {
    // find criterion and write corresponding rank in implicit critidx
    const prefRecIdx: number[] = Array(prefStatistics.length).fill(0);


    for (let recommendation = 0; recommendation < prefRec.length; recommendation++) {
        for (let criterion = 0; criterion < prefStatistics.length; criterion++) {
            for (let prefIdx = 0; prefIdx < prefStatistics[criterion].length; prefIdx++) {
                if (prefRec[recommendation] === prefStatistics[criterion][prefIdx]) {
                    prefRecIdx[criterion] = recommendation + 1;
                }
            }
        }
    }

    // handle case if idx gets overwritten (meaning top 3 come from same conflict)
    if (prefRec.length > 1) {
        // Create a new array to hold the top three lowest values
        const result: number[] = Array(prefStatistics.length).fill(0);
        // Filter out non-zero values and sort them
        const nonZeroValues = prefRecIdx.filter(value => value !== 0);
        const sortedValues = nonZeroValues.sort((a, b) => a - b);
        // Get the three lowest values
        const lowestThree = sortedValues.slice(0, 3);

        // Fill the result array with the lowest three values
        lowestThree.forEach(value => {
            const index = prefRecIdx.indexOf(value);
            result[index] = value; // Place the lowest value in the correct position
        });
        return result;
    } else {
        return prefRecIdx;

    }

}

function getJudgRecIdxArray(judgRec: number[], judgStatistics: number[][][]): number[][] {
    // find criterion and alternative and write corresponding rank in implicit critidx, altidx
    const judgRecIdx: number[][] = Array.from({length: judgStatistics.length}, () => Array(judgStatistics[0].length).fill(0));

    for (let recommendation = 0; recommendation < judgRec.length; recommendation++) {
        for (let criterion = 0; criterion < judgStatistics.length; criterion++) {
            for (let alternative = 0; alternative < judgStatistics[criterion].length; alternative++) {
                for (let judgIdx = 0; judgIdx < judgStatistics[criterion].length; judgIdx++) {
                    if (judgRec[recommendation] === judgStatistics[criterion][alternative][judgIdx]) {
                        judgRecIdx[criterion][alternative] = recommendation + 1;
                    }
                }
            }

        }
    }

    // handle case if idx gets overwritten (meaning top 3 come from same conflict)
    if (judgRec.length > 1) {
        // Create a new array to hold the top three lowest values
        const result: number[][] = Array.from({length: judgStatistics.length}, () => Array(judgStatistics[0].length).fill(0));
        // Collect all non-zero values along with their positions
        const valuePositions: { value: number, criterion: number, alternative: number }[] = [];

        for (let criterion = 0; criterion < judgRecIdx.length; criterion++) {
            for (let alternative = 0; alternative < judgRecIdx[criterion].length; alternative++) {
                if (judgRecIdx[criterion][alternative] !== 0) {
                    valuePositions.push({
                        value: judgRecIdx[criterion][alternative],
                        criterion: criterion,
                        alternative: alternative
                    });
                }
            }
        }

        // Sort values to find the three lowest
        valuePositions.sort((a, b) => a.value - b.value);
        const lowestThree = valuePositions.slice(0, 3);

        // Fill the result array with the lowest three values
        lowestThree.forEach(item => {
            result[item.criterion][item.alternative] = item.value; // Place the lowest value in the correct position
        });

        return result;
    } else {
        return judgRecIdx;

    }


}


// folgender Konflikt hat starke Auswirkungen auf den Platz der Alternative
//höchster Betrag SensivityAnalysis -> negative = rank 1 of alternative worse, positive = rank 1 of alternative better
// offen für Ausblick: Auflösungen vergleichend betrachten, z.B. Differenz etc.
function getDevelopmentRecommendation(prefSensitivities: number[][][], judgSensitivities: number[][][][]): {
    prefDevelopmentRecArray: number[][],
    judgDevelopmentRecArray: number[][][]
} {
    const numAlts = prefSensitivities.length;
    let prefRec: number[] = [];
    let prefRecIdx: number[] = [];
    const prefRecArray: number[][] = [];

    let judgRec: number[] = [];
    let judgRecIdx: number[][] = [];
    const judgRecArray: number[][][] = [];

    // get recommendations for alternatives
    for (let altWinner = 0; altWinner < numAlts; altWinner++) {
        prefRec = getBest(prefSensitivities[altWinner].flat());
        prefRecIdx = getPrefRecIdxArray(prefRec, prefSensitivities[altWinner]);
        prefRecArray.push(prefRecIdx); // push to index array for recommendation

        judgRec = getBest(judgSensitivities[altWinner].flat().flat());
        judgRecIdx = getJudgRecIdxArray(judgRec, judgSensitivities[altWinner]);
        judgRecArray.push(judgRecIdx); // push to index array for recommendation
    }

    return {prefDevelopmentRecArray: prefRecArray, judgDevelopmentRecArray: judgRecArray}
}

function getBest(values: number[]) {
    // sort shallow copy of values descending
    const sorted = [...values].sort((n1, n2) => Math.abs(n2) - Math.abs(n1));
    //console.log('sorted values',sorted);
    const best = sorted.slice(0, 1);

    return best;
}