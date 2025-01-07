import { useMemo } from 'react';
import { debounce } from 'lodash';

const useDebouncedInvalidate = (queryClient, pagination) => {
    return useMemo(
        () => debounce(() => {
            console.log("L3. Network is online, invalidating queries");
            queryClient.invalidateQueries('data');
            
            const currentData = queryClient.getQueryData('data');
            if (currentData && currentData.total < (pagination.current - 1) * pagination.pageSize) {
                pagination.setPagination((prev) => ({ ...prev, current: 1 }));
            }
        }, 500),
        [queryClient, pagination.current, pagination.pageSize]
    );
};

export default useDebouncedInvalidate;