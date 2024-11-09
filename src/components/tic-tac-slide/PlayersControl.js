import { Icon2CircleFill, Icon3CircleFill, Icon4CircleFill, Icon5CircleFill, Icon6CircleFill, PeopleFill } from "react-bootstrap-icons"
import { Col, Row } from "react-bootstrap"
import { useContext } from "react";
import { AppContext } from "./AppContext";
import getMessageText from "./messages";

export default function PlayersControl({ resetGrid }) {
    const { colors, allColors, setColors } = useContext(AppContext);
    const renderPlayers = () => {
        switch (colors.length) {
            case 2: return <Icon2CircleFill />;
            case 3: return <Icon3CircleFill />;
            case 4: return <Icon4CircleFill />;
            case 5: return <Icon5CircleFill />;
            case 6: return <Icon6CircleFill />;
            default: return <></>;
        }
    };
    return <Row className="align-items-center" title={getMessageText("NUM_PLAYERS")}>
        <Col xs={2}>
            <PeopleFill size={30} values={colors.length} color='white' />
        </Col>
        <Col xs={6} >
            <input
                type="range"
                className="form-control"
                value={colors.length}
                max={6}
                min={2}
                step={1}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    var playerColors = allColors.slice(0, value);
                    setColors(playerColors);
                    resetGrid();
                }}
                placeholder="Number of players" />
        </Col>
        <Col xs={4}>
            {renderPlayers()}
        </Col>
    </Row>
}
