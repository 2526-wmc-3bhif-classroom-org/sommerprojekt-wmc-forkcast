import type {Failure} from "~/assets/model/failure";

export type FailureHandler = {
    handler: (message: string) => void;
    id: string;
}

export default function useFailureHandler() {
    const activeKeys = ref<string[]>([]);
    const handlers = ref<FailureHandler[]>([]);

    const activeMain = ref(false);
    const mainHandler = ref<((message: string) => void) | null>(null);

    function fail(newFailure: Failure) {
        activeKeys.value = [];
        activeMain.value = false;

        handlers.value.forEach(handler => {
            handler.handler("");
        });

        mainHandler.value?.("");


        if (!newFailure.errors) {
            if (newFailure.message) {
                activeMain.value = true;
                mainHandler.value?.(newFailure.message);
            }

            return;
        }

        newFailure.errors.forEach(error => {
            handlers.value.forEach(handler => {
                if (handler.id === error.path) {
                    activeKeys.value.push(error.path);
                    handler.handler(error.msg);
                }
            });
        });
    }

    function has(key: string) {
        return activeKeys.value.includes(key);
    }

    function hasMain() {
        return activeMain.value;
    }

    function addHandler(id: string, handler: (message: string) => void) {
        handlers.value.push({handler, id});
    }

    function setMainHandler(handler: (message: string) => void) {
        mainHandler.value = handler;
    }

    return {
        fail,
        has,
        hasMain,
        addHandler,
        setMainHandler
    };
}