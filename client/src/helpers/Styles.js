export const ConditionalWrapper = ({ condition, wrapper, children })=>
    (!condition || !wrapper) ?children:wrapper(children)