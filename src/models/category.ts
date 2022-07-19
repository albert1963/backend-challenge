export interface Category {
  id: string
  name: string;
  parent_id ?: string;
  children?: Category[];
  ancestors?: Category[];
}

export interface CategoryClosure  extends Category{
  ancestor_id : string;
  descendant_id : string;
}