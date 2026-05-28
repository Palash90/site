import { useState, useEffect } from "react";
import GuitaleleViewer from "./GuitaleleViewer";
import { dummyScore, dummyScore22, dummyScore24, dummyScore34, dummyScore68 } from "./dummy_score";

export default function TabViewer(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(props.tab)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                setData(JSON.parse(data));
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [props.tab]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <div>
        <h3>Associated Tab</h3>
        <GuitaleleViewer scoreData={data} />
        <br />

        {/*
        <h3>Associated Tab 2/2</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dummyScore22, null, 2)}</pre>
        <GuitaleleViewer scoreData={dummyScore22} />
        <br />

        <h3>Associated Tab 2/4</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dummyScore24, null, 2)}</pre>
        <GuitaleleViewer scoreData={dummyScore24} />
        <br />

        <h3>Associated Tab 3/4</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dummyScore34, null, 2)}</pre>
        <GuitaleleViewer scoreData={dummyScore34} />
        <br />

        <h3>Associated Tab 6/8</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dummyScore68, null, 2)}</pre>
        <GuitaleleViewer scoreData={dummyScore68} />
        <br />

        <h3>Associated Tab 4/4 Multi Line</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(dummyScore, null, 2)}</pre>
        <GuitaleleViewer scoreData={dummyScore} />
        */}

    </div>
}

