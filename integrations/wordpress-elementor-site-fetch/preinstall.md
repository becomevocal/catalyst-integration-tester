### Install WPGraphQL on WordPress site

This integration uses WPGraphQL to fetch the data from WordPress. To install it, follow these instructions: https://www.wpgraphql.com/docs/quick-start#install-from-your-wordpress-dashboard

### Extend WPGraphQL with Elementor specific data

Add the following to the bottom of your WordPress theme's `functions.php` file. It adds the Elementor Kit ID to WPGraphQL, which this integration uses to reference the right Elementor styles for each page.

```
add_action( 'graphql_register_types', function() {

    $field_config = [
      'type' => 'String',
      'description' => __('Elementor rendered content', 'wp-graphql'),
      'args' => [
    	'myArg' => [
    	  'type' => 'String',
    	],
      ],
      'resolve' => function( $page ) {
    	if (class_exists("\\Elementor\\Plugin")) {
    		$post_ID = $page->ID;

    		$pluginElementor = \Elementor\Plugin::instance();
    		$contentElementor = $pluginElementor->frontend->get_builder_content($post_ID, true);
    	}
    	return $contentElementor;
      },
    ];
    register_graphql_field( 'Page', 'elementorContent', $field_config);

});

add_action( 'graphql_register_types', function() {

    $field_config = [
      'type' => 'String',
      'description' => __('Elementor Kit ID', 'wp-graphql'),
      'args' => [
    	'myArg' => [
    	  'type' => 'String',
    	],
      ],
      'resolve' => function( $page ) {
    	if (class_exists("\\Elementor\\Plugin")) {
    		$post_ID = $page->ID;

    		$pluginElementor = \Elementor\Plugin::instance();
    		$kitID = $pluginElementor->kits_manager->get_active_id();
    	}
    	return $kitID;
      },
    ];
    register_graphql_field( 'Page', 'elementorKitId', $field_config);

});
```