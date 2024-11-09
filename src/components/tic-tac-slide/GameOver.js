import { Alert } from "react-bootstrap"
import I18nLabel from "./I18nLabel"

export default function GameOver({ isGameOver, winners }) {

    if (isGameOver() && winners.length > 0) {
        return <Alert variant='info'>
            <I18nLabel msg="GAME_OVER" />
        </Alert>
    }

    if (isGameOver() && winners.length <= 0) {
        return <Alert variant='info'>
            <I18nLabel msg="GAME_OVER_NO_WINNER" />
        </Alert>
    }

    return <></>;

}