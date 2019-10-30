/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { IconButton, Dropdown, Toolbar } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DOWN } from '@wordpress/keycodes';
import { ColorPaletteControl, ContrastChecker } from '@wordpress/block-editor';

/**
 * Color Selector Icon component.
 *
 * @param {Object} colorControlProps colorControl properties.
 * @return {*} React Icon component.
 */
const ColorSelectorIcon = ( { backgroundColor, textColor } ) => {
	const iconStyle = {};
	if ( textColor && ! textColor.class ) {
		iconStyle[ 'color' ] = textColor.color;
	}

	if ( backgroundColor && ! backgroundColor.class ) {
		iconStyle[ 'backgroundColor' ] = backgroundColor.color;
	}

	const iconClasses = classnames( 'block-library-colors-selector__state-selection', {
		'has-background-color': backgroundColor && backgroundColor.color,
		'has-text-color': backgroundColor && backgroundColor.color,
		[ backgroundColor.class ]: backgroundColor && backgroundColor.class,
		[ textColor.class ]: textColor && textColor.class,
	} );

	return (
		<div className="block-library-colors-selector__icon-container">
			<div className={ iconClasses } style={ iconStyle }>
				Aa
			</div>
		</div>
	);
};

/**
 * Renders the Colors Selector Toolbar with the icon button.
 *
 * @param {Object} colorControlProps colorControl properties.
 * @return {*} React toggle button component.
 */
const renderToggleComponent = ( { backgroundColor, textColor } ) => ( { onToggle, isOpen } ) => {
	const openOnArrowDown = ( event ) => {
		if ( ! isOpen && event.keyCode === DOWN ) {
			event.preventDefault();
			event.stopPropagation();
			onToggle();
		}
	};

	return (
		<Toolbar>
			<IconButton
				className="components-icon-button components-toolbar__control block-library-colors-selector__toggle"
				label={ __( 'Open Colors Selector' ) }
				onClick={ onToggle }
				onKeyDown={ openOnArrowDown }
				icon={ <ColorSelectorIcon backgroundColor={ backgroundColor } textColor={ textColor } /> }
			/>
		</Toolbar>
	);
};

const renderContent = ( { backgroundColor, textColor, onColorChange = noop } ) => ( () => {
	const setColor = ( attr ) => ( value ) => onColorChange( { attr, value } );

	return (
		<>
			<div className="color-palette-controller-container">
				<ColorPaletteControl
					value={ backgroundColor.color }
					onChange={ setColor( 'backgroundColor' ) }
					label={ __( 'Background Color' ) }
				/>
			</div>

			<div className="color-palette-controller-container">
				<ColorPaletteControl
					value={ textColor.color }
					onChange={ setColor( 'textColor' ) }
					label={ __( 'Text Color' ) }
				/>
			</div>

			<ContrastChecker
				textColor={ textColor.color }
				backgroundColor={ backgroundColor.color }
				isLargeText={ false }
			/>
		</>
	);
} );

export default ( colorControlProps ) => (
	<Dropdown
		position="bottom right"
		className="block-library-colors-selector"
		contentClassName="block-library-colors-selector__popover"
		renderToggle={ renderToggleComponent( colorControlProps ) }
		renderContent={ renderContent( colorControlProps ) }
	/>
);
