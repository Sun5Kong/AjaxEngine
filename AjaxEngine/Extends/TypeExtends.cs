﻿using AjaxEngine.Reflection;
using System;
using System.Collections.Generic;

namespace AjaxEngine.Extends
{
    public static class TypeExtends
    {
        public static T GetAttribute<T>(this Type type)
        {
            return AttributeFactory.GetAttribute<T>(type);
        }
        public static List<T> GetAttributes<T>(this Type type)
        {
            return AttributeFactory.GetAttributes<T>(type);
        }
    }
}
