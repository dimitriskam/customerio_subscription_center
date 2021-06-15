module.exports =  () => {

    // Please follow this guide => 
    // to define your customer.io attribute structure below
    const attributes_structure = [
        [ 'first_name', {title: 'First Name', section: 'Personal Details', type: 'field', placeholder: 'Enter your first name'} ], 
        [ 'last_name', {title: 'Last Name', section: 'Personal Details', type: 'field', placeholder: 'Enter your last name'}],
        [ 'email', {title: 'Email', section: 'Personal Details', type: 'field', placeholder: 'Enter your email address'}],
        
        [ 'sub_a', {title: 'Subscription A', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_b', {title: 'Subscription B', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_c', {title: 'Subscription C', section: 'Tester', type: 'checkbox'}],
        [ 'sub_d', {title: 'Subscription D', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_e', {title: 'Subscription E', section: 'Tester', type: 'checkbox'}],
        [ 'sub_f', {title: 'Subscription F', section: 'Tester', type: 'checkbox'}]
    ]

    return attributes_structure
}