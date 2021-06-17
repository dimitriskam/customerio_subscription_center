module.exports =  () => {

    // Please follow this guide => https://www.notion.so/Documentation-04f15add8bc74d0b90734925ca88fdf4
    // to define your customer.io attribute structure below
    const attributes_structure = [
        [ 'first_name', {title: 'First Name', section: 'Personal Details', type: 'field', placeholder: 'Enter your first name'} ], 
        [ 'last_name', {title: 'Last Name', section: 'Personal Details', type: 'field', placeholder: 'Enter your last name'}],
        [ 'email', {title: 'Email', section: 'Personal Details', type: 'field', placeholder: 'Enter your email address'}],
        
        [ 'sub_a', {title: 'Subscription A', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_b', {title: 'Subscription B', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_c', {title: 'Subscription C', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_d', {title: 'Subscription D', section: 'Marketing', type: 'checkbox'}],
        [ 'sub_e', {title: 'Subscription E', section: 'Web Development', type: 'checkbox'}],
        [ 'sub_f', {title: 'Subscription F', section: 'Web Development', type: 'checkbox'}],
        [ 'sub_g', {title: 'Subscription G', section: 'New Example Section', type: 'checkbox'}]
    ]

    return attributes_structure
}