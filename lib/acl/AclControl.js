var _ = require('lodash');

module.exports = (function(){

  function AclControl(acl){
    this.acl = acl;
    this._roles = [];
    this._actions = [];
    this._resources = [];
  }

  /**
   * Specify role to allow
  *
  * @example
  * // allow admin
  * acl.allow('admin')
  *
  *
  * @param {string} roles - The name of role
  */
  AclControl.prototype.allow = function(roles){
      
      if(typeof roles === 'string') this._roles = roles;
      // if(typeof roles === 'string') this._control._roles = _.uniq([...this._control._roles, roles ])
      // if(Array.isArray(roles)) {
      //     this._control._roles = _.uniq([...this._control._roles, ...roles ])
      // }
      return this;
  }

  /**
  * Specify actions for current control
  *
  * @example
  * // to view
  * acl.to('view')
  *
  * @param {array|string} actions - The name(s) of actions
  */
  AclControl.prototype.to = function(actions){

      if(typeof actions === 'string') this._actions = _.uniq([...this._actions, actions ]);

      if(Array.isArray(actions)) this._actions = _.uniq([...this._actions, ...actions ]);

      return this;
  }

  /**
   * Specify resources for current control
  *
  * @example
  * // add blog to current control
  * acl.on('blog')
  *
  * @param {array|string} resources - The name(s) of resources
  */
  AclControl.prototype.on = function(resources){

      if(typeof resources === 'string') this._resources = _.uniq([...this._resources, resources ]);

      if(Array.isArray(resources)) this._resources = _.uniq([...this._resources, ...resources ]);

      return this;
  }


  /**
   * Commit current control
  *
  * @example
  * //
  * acl.commit()
  *
  *  @param {Function} Callback called when finished.
  *  @return {Promise} Promise resolved when finished
  */
  AclControl.prototype.commit = async function(){

      let acl = this.acl;
      let roles = this._roles;
      let actions = this._actions;
      let resources = this._resources;

      // const t = await this._sequelize.transaction();

      return acl.createPermissions(resources, actions, {all :true}).then((perms)=> {

          return acl.makeRole(roles).then(({role})=>{

              return role.getPermissions().then((assignedPerms)=> {
                  let perms2add = _.differenceBy(perms, assignedPerms, (r) => r.name)

                  return role.addPermissions(perms2add).then(()=>{
                      return {
                          role,
                          permissions : [...assignedPerms, ...perms2add] 
                      }
                  });
              });
          });
      })
  }


  return AclControl;

})();