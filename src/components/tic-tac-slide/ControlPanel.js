import { Button, Row, Col, Form } from 'react-bootstrap';
import { ArrowClockwise, SkipForwardBtnFill, ArrowsMove, CardChecklist } from 'react-bootstrap-icons';
import { AppContext } from './AppContext';
import { useContext } from 'react';
import PlayerIcon from './PlayerIcon';
import PlayersControl from './PlayersControl';
import PlaceHolder from './PlaceHolder';
import getMessageText from './messages';
import Rules from './Rules';

const ControlPanel = () => {
    const { colors, winners, moveActivated, setMoveActivated, selectedColor, setSelectedColor, getNextColor, clearWinners, setGrid, initializeGrid, size, cellClicked, setCellClicked, setTurnComplete, changePlayer, isGameOver, handleShowRule } = useContext(AppContext);

    const resetGrid = () => {
        setSelectedColor(colors[0].val);
        setCellClicked(false);
        clearWinners();
        setGrid(initializeGrid(size));
        setTurnComplete(true);
    }

    const renderPlayerIcons = () => {
        return colors.map((color) => {
            const active = color.val === selectedColor
            return <PlayerIcon key={"player-" + color.val} active={active} color={color.val} winners={winners} />
        });
    }

    const NavigationControl = () => {
        return <Row className="align-items-center" title={getMessageText(moveActivated ? "DISABLE_NAVIGATION" : "ENABLE_NAVIGATION")}>
            <Col xs={2}>
                <Form.Check checked={moveActivated} onChange={() => {
                    setMoveActivated(!moveActivated);
                    resetGrid();
                }} />
            </Col>
            <Col xs={4}>
                <ArrowsMove size={30} />
            </Col>
        </Row>;
    }

    return <Row className="d-flex align-items-center">
        <Col md={3}>
            <PlayersControl resetGrid={resetGrid} />
        </Col>
        <Col md={1} >
            {NavigationControl()}
        </Col>

        <Col md={5}>
            <Row>{renderPlayerIcons()}</Row>
        </Col>

        <Col md={1}>
            {moveActivated && cellClicked && !isGameOver() ?
                <SkipForwardBtnFill size={45} color={getNextColor()} onClick={() => changePlayer()} title={getMessageText("SKIP")} /> :
                <PlaceHolder />}
        </Col>

        <Col md={2} className="text-end">
            <Row>
                <Col title={getMessageText("RULES")}>
                    <Button variant='light' onClick={() => handleShowRule()} ><CardChecklist /></Button>
                    <Rules />
                </Col>
                <Col  title={getMessageText("RESTART")}>
                    <Button variant='light' onClick={() => resetGrid()}>
                        <ArrowClockwise />
                    </Button>
                </Col>
            </Row>
        </Col>
    </Row>;
}

export default ControlPanel;