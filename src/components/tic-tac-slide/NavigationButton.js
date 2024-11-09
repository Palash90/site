import { useContext } from "react";
import { AppContext } from "./AppContext";
import { Button } from "react-bootstrap";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "react-bootstrap-icons";

export default function NavigationButton({ direction, action }) {
    const { isGameOver, moveActivated, cellClicked, changePlayer, selectedColor, winners } = useContext(AppContext);

    const NavigationIcon = () => {
        switch (direction) {
            case 'up': return moveActivated ? <ArrowUp /> : <ArrowUp color='transparent' />
            case 'down': return moveActivated ? <ArrowDown /> : <ArrowDown color='transparent' />
            case 'left': return moveActivated ? <ArrowLeft /> : <ArrowLeft color='transparent' />
            case 'right': return moveActivated ? <ArrowRight /> : <ArrowRight color='transparent' />
        }
    }

    const ColorInactive = () => {
        return <Button
            variant="outline"
            onClick={() => { }}
            disabled
        >
            <NavigationIcon />
        </Button>;
    }

    if (!moveActivated) {
        return <Button
            variant="outline-secondary"
            onClick={() => { }}
            style={{ borderColor: 'transparent' }}
            disabled
        >
            <NavigationIcon />
        </Button>
    }

    if (moveActivated && cellClicked && !winners.includes(selectedColor)) {
        return <Button
            variant="success"
            className="rotate-button"
            onClick={() => {
                if (!isGameOver()) {
                    action();
                    changePlayer();
                }
            }}
        >
            <NavigationIcon />
        </Button>
    }



    return <ColorInactive> <NavigationIcon /></ColorInactive>;
}