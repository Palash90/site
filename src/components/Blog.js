import Markdown from "react-markdown"
import { useParams } from "react-router-dom"
import React, { useState, useEffect } from 'react';

export default function Blog() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let params = useParams()

    useEffect(() => {
        var blog = window.findProp("blogs.swe").concat(window.findProp("blogs.music")).find(b => b.id == params.blogId)
        if (blog) {
            console.log(blog)
            fetch(blog.url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    console.log(data)
                    setData(data);
                    setLoading(false);
                })
                .catch(error => {
                    setError(error);
                    setLoading(false);
                });
        } else {
            setError({ message: window.findProp("labels.blogNotExists") });
            setLoading(false);
        }
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    return <Markdown>{data}</Markdown>

}
