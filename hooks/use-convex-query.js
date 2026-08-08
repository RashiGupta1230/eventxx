import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export const useConvexQuery = (query, ...args) => {
    const result = useQuery(query, ...args);

    return {
        data: result,
        isLoading: result === undefined,
        error: null,
    }
};

export const useConvexMutation = (mutation) => {
    const mutationFn = useMutation(mutation);

    const [data, setData] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (...args) => {
        setLoading(true);
        setError(null);

        try {
            const response = await mutationFn(...args);
            setData(response);
            return response;
        } catch (error) {
            setError(error);
            toast.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        isLoading: loading,
        error,
        mutate,
    };
};
