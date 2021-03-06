import * as React from 'react';
import { Global, css } from '@emotion/core';
import { Container, Input, Item } from './styles';

const KEY_CODE = {
  BACKSPACE: 8,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  DELETE: 46,
};

type Props = {
  length?: number;
  onChange: (data: string) => any;
  placeholder?: string;
};

export default ({ length = 4, onChange, placeholder = '·' }: Props) => {
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [value, setValue] = React.useState<string[]>(
    new Array(length).fill(placeholder)
  );

  const codeInputRef = React.createRef<HTMLInputElement>();
  const itemsRef = React.useMemo(
    () =>
      new Array(length).fill(null).map(() => React.createRef<HTMLDivElement>()),
    [length]
  );

  const isCodeRegex = new RegExp(`^[0-9]{${length}}$`);

  const getItem = (index: number) => itemsRef[index].current!;
  const focusItem = (index: number): void => getItem(index).focus();
  const blurItem = (index: number): void => getItem(index).blur();

  const onItemFocus = (index: number) => () => {
    setActiveIndex(index);
    if (codeInputRef.current) codeInputRef.current.focus();
  };

  const onInputKeyUp = ({ key, keyCode }: React.KeyboardEvent) => {
    const newValue = [...value];
    const nextIndex = activeIndex + 1;
    const prevIndex = activeIndex - 1;

    const isLast = nextIndex === length;
    const isDeleting =
      keyCode === KEY_CODE.DELETE || keyCode === KEY_CODE.BACKSPACE;

    // keep items focus in sync
    onItemFocus(activeIndex);

    // on delete, replace the current value
    // and focus on the previous item
    if (isDeleting) {
      newValue[activeIndex] = placeholder;
      setValue(newValue);

      if (activeIndex > 0) {
        setActiveIndex(prevIndex);
        focusItem(prevIndex);
      }

      return;
    }

    // if the key pressed is not a number
    // don't do anything
    if (Number.isNaN(+key)) return;

    // reset the current value
    // and set the new one
    if (codeInputRef.current) codeInputRef.current.value = '';
    newValue[activeIndex] = key;
    setValue(newValue);

    if (!isLast) {
      setActiveIndex(nextIndex);
      focusItem(nextIndex);
      return;
    }

    if (codeInputRef.current) codeInputRef.current.blur();
    getItem(activeIndex).blur();
    setActiveIndex(-1);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: changeValue } = e.target;
    const isCode = isCodeRegex.test(changeValue);

    if (!isCode) return;
    setValue(changeValue.split(''));
    blurItem(activeIndex);
  };

  const onInputBlur = () => {
    setActiveIndex(-1);
    blurItem(activeIndex);
  };

  React.useEffect(() => {
    onChange(value.join(''));
  }, [value]);

  return (
    <React.Fragment>
      <Global
        styles={css`
          :root {
            --ReactInputVerificationCode-itemWidth: 4.5rem;
            --ReactInputVerificationCode-itemHeight: 5rem;
            --ReactInputVerificationCode-itemSpacing: 1rem;
          }
        `}
      />

      <Container
        // needed for styling
        itemsCount={length}
      >
        <Input
          ref={codeInputRef}
          className='ReactInputVerificationCode__input'
          autoComplete='one-time-code'
          type='text'
          inputMode='decimal'
          id='one-time-code'
          // use onKeyUp rather than onChange for a better control
          // onChange is still needed to handle the autocompletion
          // when receiving a code by SMS
          onChange={onInputChange}
          onKeyUp={onInputKeyUp}
          onBlur={onInputBlur}
          // needed for styling
          activeIndex={activeIndex}
        />

        {itemsRef.map((ref, i) => (
          <Item
            key={i}
            ref={ref}
            role='button'
            tabIndex={0}
            onFocus={onItemFocus(i)}
            // needed for emotion-styled
            isActive={i === activeIndex}
          >
            {value[i] || placeholder}
          </Item>
        ))}
      </Container>
    </React.Fragment>
  );
};
