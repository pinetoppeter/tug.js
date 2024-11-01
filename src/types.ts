export type DragAndDropProps = {
    selector: string;
    options?: {
        observe: boolean
    }
};

export type DragProps = DragAndDropProps & {
    onDrop?: CallableFunction
}

export type DropProps = DragAndDropProps & {
    
}