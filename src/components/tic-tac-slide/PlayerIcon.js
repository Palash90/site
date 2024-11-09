import { PersonCircle, PersonFill } from "react-bootstrap-icons"
import PlayerAward from "./PlayerAward"
import { Col } from "react-bootstrap"
import getMessageText from "./messages"

export default function PlayerIcon({ winners, color, active }) {
    if (active) {
        return <Col key={color} className="d-flex align-items-center">
            <PersonCircle
                key={color}
                color={color}
                size={45}
                title={getMessageText("ACTIVE_PLAYER")}
            />
            <sup>
                <PlayerAward key={color} winners={winners} player={color} size={15} />
            </sup>
        </Col>
    } else {
        return <Col key={color} className="d-flex align-items-center">
            <PersonFill
                key={color}
                color={color}
                size={45}
            />
            <sup>
                <PlayerAward key={color} winners={winners} player={color} size={15} />
            </sup>
        </Col>
    }

}
