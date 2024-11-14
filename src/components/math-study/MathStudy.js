import { useState } from "react";
import MathQuiz from "./MathQuiz";

export default function MathStudy() {
    const [screen, setScreen] = useState(2);

    if (screen === 2) {
        return <MathQuiz
            min1={0}
            max1={20}
            min2={0}
            max2={20}
            allowDecimal={false}
            decimalPlace={0}
            operations={['add', 'subtract', 'multiply', 'divide']}

        />
    }

    return
}