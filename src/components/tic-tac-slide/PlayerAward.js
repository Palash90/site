import { Gem, TrophyFill } from "react-bootstrap-icons"
import PlaceHolder from "./PlaceHolder"

export default function PlayerAward({ winners, player, size }) {
    switch (winners.indexOf(player)) {
        case 0: return <Gem color={"white"} size={size} />
        case 1: return <TrophyFill color={"#FFD700"} size={size} />
        case 2: return <TrophyFill color={"#C0C0C0"} size={size} />
        case 3: return <TrophyFill color={"#CD7F32"} size={size} />
        default: return <PlaceHolder />
    }
}
