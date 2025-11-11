package com.talentiq.backend.service;

import org.springframework.stereotype.Service;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

@Service
public class EmailValidationService {

    /**
     * Validates if an email domain has valid MX records
     * @param email The email address to validate
     * @return true if MX records exist, false otherwise
     */
    public boolean hasValidMXRecords(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1);

        try {
            return checkMXRecords(domain);
        } catch (Exception e) {
            // Log the error but don't expose internal details
            System.err.println("MX record check failed for domain: " + domain + " - " + e.getMessage());
            return false;
        }
    }

    /**
     * Performs DNS lookup for MX records
     */
    private boolean checkMXRecords(String domain) throws NamingException {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.dns.DnsContextFactory");

        DirContext ctx = null;
        try {
            ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(domain, new String[] { "MX" });
            Attribute mx = attrs.get("MX");

            // If MX record exists and has at least one entry
            return mx != null && mx.size() > 0;

        } finally {
            if (ctx != null) {
                try {
                    ctx.close();
                } catch (NamingException e) {
                    // Ignore close errors
                }
            }
        }
    }

    /**
     * Validates email format using regex
     */
    public boolean isValidEmailFormat(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    /**
     * Complete email validation (format + MX records)
     */
    public boolean isValidEmail(String email) {
        return isValidEmailFormat(email) && hasValidMXRecords(email);
    }
}