import { messages, queries } from '../constants';
import { computeAccessibleName, getRole } from 'dom-accessibility-api';
import { getSuggestedQuery } from '@testing-library/dom';

export function getData({ rootNode, element }) {
  const type = element.getAttribute('type');
  const tagName = element.tagName;

  // escape id to prevent querySelector from tripping over corrupted html like:
  //   <input id="button\n<button> & <input id=\ntype="text" />
  const id = (element.getAttribute('id') || '')
    .replace(/\s/g, '')
    .replace(/"/g, '\\"');

  const labelElem = id ? rootNode.querySelector(`[for="${id}"]`) : null;
  const labelText = labelElem ? labelElem.innerText : null;

  return {
    role: element.getAttribute('aria-hidden')
      ? undefined
      : element.getAttribute('role') ||
        // input's require a type for the role
        (tagName === 'INPUT' && type !== 'text' ? '' : getRole(element)),
    name: computeAccessibleName(element),
    tagName: tagName,
    type: type,
    labelText: labelText,
    placeholderText: element.getAttribute('placeholder'),
    text: element.innerText,
    displayValue: element.getAttribute('value'),

    altText: element.getAttribute('alt'),
    title: element.getAttribute('title'),

    testId: element.getAttribute('data-testid'),
  };
}

const emptyResult = { data: {}, suggestion: {} };
export function getQueryAdvise({ rootNode, element }) {
  if (
    !rootNode ||
    rootNode?.nodeType !== Node.ELEMENT_NODE ||
    element?.nodeType !== Node.ELEMENT_NODE
  ) {
    return emptyResult;
  }
  const suggestedQuery = getSuggestedQuery(element);
  const data = getData({ rootNode, element });

  if (!suggestedQuery) {
    return {
      suggestion: {
        level: 3,
        expression: 'container.querySelector(…)',
        method: '',
        ...messages[3],
      },
      data,
    };
  }
  const { level } = queries.find(
    ({ method }) => method === suggestedQuery.queryMethod,
  );
  const suggestion = {
    expression: `screen.${suggestedQuery.toString()}`,
    level,
    method: suggestedQuery.queryMethod,
    ...messages[level],
  };
  return {
    data,
    suggestion,
  };
}
