/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import {
	ExternalLink,
	PanelBody,
	TextareaControl,
	TextControl,
	Toolbar,
	ToggleControl,
	ToolbarButton,
} from '@wordpress/components';
import {
	LEFT,
	RIGHT,
	UP,
	DOWN,
	BACKSPACE,
	ENTER,
} from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { Fragment, useState, useRef, useEffect } from '@wordpress/element';

function NavigationMenuItemEdit( {
	attributes,
	isSelected,
	isParentOfSelectedBlock,
	setAttributes,
	fetchSearchSuggestions,
} ) {
	const { label, opensInNewTab, title, url } = attributes;
	const link = title ? { title, url } : null;
	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	const [ wasCloseByLinkControl, setWasCloseByLinkControl ] = useState( false );

	const plainTextRef = useRef( null );

	/**
	 * It's a kind of hack to handle closing the LinkControl popover
	 * clicking on the ToolbarButton link.
	 */
	useEffect( () => {
		if ( ! isSelected ) {
			setIsLinkOpen( false );
			setWasCloseByLinkControl( false );
		}
		return () => {
			setIsLinkOpen( false );
			setWasCloseByLinkControl( false );
		};
	}, [ isSelected ] );

	/**
	 * `onKeyDown` LinkControl handler.
	 * It takes over to stop the event propagation to make the
	 * navigation work, avoiding undesired behaviors.
	 * For instance, it will block to move between menu items
	 * when the LinkOver is focused.
	 *
	 * @param {Event} event
	 */
	const handleLinkControlOnKeyDown = ( event ) => {
		const { keyCode } = event;

		if ( [ LEFT, DOWN, RIGHT, UP, BACKSPACE, ENTER ].indexOf( keyCode ) > -1 ) {
			// Stop the key event from propagating up to ObserveTyping.startTypingInTextField.
			event.stopPropagation();
		}
	};

	/**
	 * Updates the link attribute when it changes
	 * through of the `onLinkChange` LinkControl callback.
	 *
	 * @param {Object|null} itemLink Link object if it has been selected. Otherwise, Null.
	 */
	const updateLink = ( itemLink ) => {
		if ( ! itemLink ) {
			// If not link, then set empty string to link attrs.
			return setAttributes( { title: '', url: '' } );
		}

		setAttributes( { title: itemLink.title, url: itemLink.url } );
	};

	/**
	 * It updates the link attribute when the
	 * link settings changes.
	 *
	 * @param {string} setting Setting type, for instance, `new-tab`.
	 * @param {string} value Setting type value.
	 */
	const updateLinkSetting = ( setting, value ) => {
		if ( 'new-tab' ) {
			setAttributes( { opensInNewTab: value } );
		}
	};

	let content;
	if ( isSelected ) {
		content = (
			<div className="wp-block-navigation-menu-item__field-container">
				<TextControl
					ref={ plainTextRef }
					className="wp-block-navigation-menu-item__field"
					value={ label }
					onChange={ ( labelValue ) => setAttributes( { label: labelValue } ) }
					label={ __( 'Navigation Label' ) }
					hideLabelFromVision={ true }
				/>
				{ isLinkOpen &&
					<LinkControl
						className="wp-block-navigation-menu-item__inline-link-input"
						onKeyDown={ handleLinkControlOnKeyDown }
						onKeyPress={ ( event ) => event.stopPropagation() }
						currentLink={ link }
						onLinkChange={ updateLink }
						onClose={ () => {
							setWasCloseByLinkControl( true );
							setIsLinkOpen( false );
						} }
						currentSettings={ { 'new-tab': opensInNewTab } }
						onSettingsChange={ updateLinkSetting }
						fetchSearchSuggestions={ fetchSearchSuggestions }
					/>
				}
			</div>
		);
	} else {
		content = (
			<div className="wp-block-navigation-menu-item__container">
				{ ( link && link.url ) && (
					<ExternalLink href={ link.url }>{ label }</ExternalLink>
				) }
				{ ( ! link || ! link.url ) && label }
			</div>
		);
	}

	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<ToolbarButton
						name="link"
						icon="admin-links"
						title={ __( 'Link' ) }
						onClick={ () => {
							// If the popover was closed by click outside,
							// then there is not nothing to do here.
							if ( wasCloseByLinkControl ) {
								setWasCloseByLinkControl( false );
								return;
							}
							setIsLinkOpen( ! isLinkOpen );
						} }
					/>
				</Toolbar>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Menu Settings' ) }
				>
					<ToggleControl
						checked={ attributes.opensInNewTab }
						onChange={ ( newTab ) => {
							setAttributes( { opensInNewTab: newTab } );
						} }
						label={ __( 'Open in new tab' ) }
					/>
					<TextareaControl
						value={ attributes.description || '' }
						onChange={ ( description ) => {
							setAttributes( { description } );
						} }
						label={ __( 'Description' ) }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'SEO Settings' ) }
				>
					<TextControl
						value={ attributes.title || '' }
						onChange={ ( itemTitle ) => {
							setAttributes( { title: itemTitle } );
						} }
						label={ __( 'Title Attribute' ) }
						help={ __( 'Provide more context about where the link goes.' ) }
					/>
					<ToggleControl
						checked={ attributes.nofollow }
						onChange={ ( nofollow ) => {
							setAttributes( { nofollow } );
						} }
						label={ __( 'Add nofollow to menu item' ) }
						help={ (
							<Fragment>
								{ __( 'Don\'t let search engines follow this link.' ) }
								<ExternalLink
									className="wp-block-navigation-menu-item__nofollow-external-link"
									href={ __( 'https://codex.wordpress.org/Nofollow' ) }
								>
									{ __( 'What\'s this?' ) }
								</ExternalLink>
							</Fragment>
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div className={ classnames(
				'wp-block-navigation-menu-item', {
					'is-editing': isSelected || isParentOfSelectedBlock,
					'is-selected': isSelected,
				} ) }
			>
				{ content }
				{ ( isSelected || isParentOfSelectedBlock ) &&
					<InnerBlocks
						allowedBlocks={ [ 'core/navigation-menu-item' ] }
					/>
				}
			</div>
		</Fragment>
	);
}

export default withSelect( ( select, ownProps ) => {
	const { hasSelectedInnerBlock, getSettings } = select( 'core/block-editor' );
	const { clientId } = ownProps;

	return {
		isParentOfSelectedBlock: hasSelectedInnerBlock( clientId, true ),
		fetchSearchSuggestions: getSettings().__experimentalFetchLinkSuggestions,
	};
} )( NavigationMenuItemEdit );
