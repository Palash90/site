import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Row, Spinner } from "react-bootstrap";

// 1. Convert static imports into dynamic lazy imports
const GridApp = lazy(() => import("./tic-tac-slide/App"));
const StudyApp = lazy(() => import("./study/Study"));

export default function CustomComponent() {
    let params = useParams();

    // 2. Map the dynamically imported component classes, NOT elements (no JSX tags here)
    const componentMap = {
        "tic-tac-slide": GridApp,
        "study": StudyApp,
    };

    // Grab the component class based on the URL parameter
    const SelectedComponent = componentMap[params.componentId];

    return (
        <Container>
            <Row>
                <Col>
                    {/* 3. Wrap in Suspense to show a fallback loader while the file downloads */}
                    <Suspense
                        fallback={
                            <div className="text-center my-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading your app...</p>
                            </div>
                        }
                    >
                        {SelectedComponent ? (
                            <SelectedComponent />
                        ) : (
                            <div className="text-center my-5">
                                <h3>App Not Found 🛑</h3>
                                <p>We couldn't find the tool you are looking for.</p>
                            </div>
                        )}
                    </Suspense>
                </Col>
            </Row>
        </Container>
    );
}