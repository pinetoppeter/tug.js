export type DragAndDropProps = {
    selector: string;
    options?: {
        observe?: boolean,
        dragHandle?: string | string[] // css selector(s) 
    }
};

export type DragProps = DragAndDropProps & {
    onDrop?: CallableFunction
}

export type DropProps = DragAndDropProps & {
    
}